const crypto = require('crypto');
const User = require('../models/User');
const Role = require('../models/Role');
const Student = require('../models/Student');
const Session = require('../models/Session');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const logAuditEvent = require('../utils/auditLogger');

// Helper to parse User-Agent
const parseUserAgent = (ua = '') => {
  let browser = 'Browser';
  if (ua.includes('Edg/')) browser = 'Microsoft Edge';
  else if (ua.includes('Chrome/')) browser = 'Google Chrome';
  else if (ua.includes('Firefox/')) browser = 'Mozilla Firefox';
  else if (ua.includes('Safari/')) browser = 'Apple Safari';

  let os = 'OS';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Macintosh')) os = 'macOS';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  else if (ua.includes('Linux')) os = 'Linux';

  const device = (ua.includes('Mobi') || ua.includes('Android') || ua.includes('iPhone')) ? 'Mobile' : 'Desktop';
  return { browser, os, device };
};

const sendTokenResponse = async (user, statusCode, res, req) => {
  // Session timing strictly set to 2 hours across all roles
  const SESSION_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours
  const tokenExpiresIn = process.env.JWT_EXPIRE || '2h';
  const sessionExpiresInMs = SESSION_DURATION_MS;

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: tokenExpiresIn
  });

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const ua = req?.headers?.['user-agent'] || '';
  const { browser, os, device } = parseUserAgent(ua);
  const ip = req?.headers?.['x-forwarded-for']?.split(',')[0]?.trim() || req?.socket?.remoteAddress || req?.ip || '127.0.0.1';

  let session = null;
  try {
    session = await Session.create({
      userId: user._id,
      institutionId: user.institutionId || null,
      tokenHash,
      deviceInfo: { browser, os, device, rawUserAgent: ua },
      ip,
      location: 'India',
      expiresAt: new Date(Date.now() + sessionExpiresInMs)
    });
  } catch (err) {
    console.error('Session registry error:', err.message);
  }

  res.status(statusCode).json({
    success: true,
    token,
    sessionId: session?._id || null,
    expiresAt: new Date(Date.now() + sessionExpiresInMs).toISOString(),
    expiresInMs: sessionExpiresInMs,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      institutionId: user.institutionId || null,
      studentProfile: user.studentProfile || null
    }
  });
};

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Private/Admin (Bootstrap only when zero users exist)
exports.register = async (req, res, next) => {
  try {
    const { username, email, password, role, institutionId } = req.body;

    const userCount = await User.countDocuments();
    if (userCount > 0) {
      const callerRole = req.user?.role?.name || (typeof req.user?.role === 'string' ? req.user.role : '');
      if (callerRole !== 'SuperAdmin' && callerRole !== 'Admin') {
        return res.status(403).json({
          success: false,
          error: 'Registration is restricted: only authorized administrators can register new accounts'
        });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role,
      institutionId: institutionId || null
    });

    await logAuditEvent(req, {
      action: 'CREATE',
      resource: 'User',
      resourceId: user._id,
      details: `New user registered: ${username}`,
      riskLevel: 'MEDIUM'
    });

    await sendTokenResponse(user, 201, res, req);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Please provide a username and password' });
    }

    const identifier = username.trim();
    const escapeRegex = (string) => string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const safeRegex = new RegExp(`^${escapeRegex(identifier)}$`, 'i');

    const user = await User.findOne({
      $or: [{ username: safeRegex }, { email: safeRegex }]
    })
      .select('+password')
      .populate('role')
      .populate('studentProfile');

    if (!user) {
      await logAuditEvent(req, {
        action: 'FAILED_LOGIN',
        resource: 'Session',
        details: `Failed sign-in attempt for identifier "${identifier}"`,
        riskLevel: 'MEDIUM'
      });
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      await logAuditEvent(req, {
        action: 'FAILED_LOGIN',
        resource: 'Session',
        details: `Incorrect password attempt for user "${user.username}"`,
        riskLevel: 'HIGH'
      });
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Attach user to req for audit logger
    req.user = user;

    await logAuditEvent(req, {
      action: 'LOGIN',
      resource: 'Session',
      details: `User ${user.username} signed in successfully`,
      riskLevel: 'LOW'
    });

    await sendTokenResponse(user, 200, res, req);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update user credentials
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
exports.updateCredentials = async (req, res, next) => {
  try {
    const { username, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    if (currentPassword && newPassword) {
      if (!(await bcrypt.compare(currentPassword, user.password))) {
        return res.status(401).json({ success: false, error: 'Incorrect current password' });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    if (username) {
      user.username = username;
    }

    await user.save();

    await logAuditEvent(req, {
      action: 'UPDATE',
      resource: 'Profile',
      resourceId: user._id,
      details: `User ${user.username} updated profile credentials`,
      riskLevel: 'HIGH'
    });

    await sendTokenResponse(user, 200, res, req);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get active user device sessions
// @route   GET /api/v1/auth/sessions
// @access  Private
exports.getSessions = async (req, res) => {
  try {
    const currentToken = req.headers.authorization?.split(' ')[1] || '';
    const currentTokenHash = crypto.createHash('sha256').update(currentToken).digest('hex');

    const sessions = await Session.find({ userId: req.user._id, isRevoked: false })
      .sort('-lastActive')
      .limit(20);

    const data = sessions.map(s => ({
      _id: s._id,
      browser: s.deviceInfo?.browser || 'Browser',
      os: s.deviceInfo?.os || 'System',
      device: s.deviceInfo?.device || 'Desktop',
      ip: s.ip,
      location: s.location || 'India',
      lastActive: s.lastActive,
      isCurrent: s.tokenHash === currentTokenHash
    }));

    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Revoke specific device session
// @route   POST /api/v1/auth/sessions/revoke/:id
// @access  Private
exports.revokeSession = async (req, res) => {
  try {
    const session = await Session.findOne({ _id: req.params.id, userId: req.user._id });
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    session.isRevoked = true;
    await session.save();

    await logAuditEvent(req, {
      action: 'REVOKE',
      resource: 'Session',
      resourceId: session._id,
      details: `Revoked session from ${session.deviceInfo?.browser} (${session.ip})`,
      riskLevel: 'MEDIUM'
    });

    res.status(200).json({ success: true, message: 'Device session revoked' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Revoke all other device sessions
// @route   POST /api/v1/auth/sessions/revoke-all
// @access  Private
exports.revokeAllOtherSessions = async (req, res) => {
  try {
    const currentToken = req.headers.authorization?.split(' ')[1] || '';
    const currentTokenHash = crypto.createHash('sha256').update(currentToken).digest('hex');

    await Session.updateMany(
      { userId: req.user._id, tokenHash: { $ne: currentTokenHash }, isRevoked: false },
      { $set: { isRevoked: true } }
    );

    await logAuditEvent(req, {
      action: 'REVOKE',
      resource: 'Session',
      details: `User logged out from all other active devices`,
      riskLevel: 'HIGH'
    });

    res.status(200).json({ success: true, message: 'Logged out of all other devices successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Logout user and revoke session ID
// @route   POST /api/v1/auth/logout
// @access  Public / Private
exports.logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    let token = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.body?.token) {
      token = req.body.token;
    }

    const sessionId = req.body?.sessionId;

    if (token) {
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      await Session.updateMany({ tokenHash }, { $set: { isRevoked: true } });
    }
    if (sessionId) {
      await Session.updateOne({ _id: sessionId }, { $set: { isRevoked: true } });
    }

    if (req.user) {
      await logAuditEvent(req, {
        action: 'LOGOUT',
        resource: 'Session',
        details: `User ${req.user.username || req.user._id} signed out / session revoked`,
        riskLevel: 'LOW'
      }).catch(() => {});
    }

    res.status(200).json({ success: true, message: 'Session successfully revoked and logged out' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get total count of users
// @route   GET /api/v1/auth/users/count
// @access  Private
exports.getUsersCount = async (req, res, next) => {
  try {
    const filter = req.user?.role?.name === 'SuperAdmin' ? {} : { institutionId: req.user?.institutionId };
    const count = await User.countDocuments(filter);
    res.status(200).json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
