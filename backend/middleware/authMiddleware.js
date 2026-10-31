const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Student = require('../models/Student');
const Session = require('../models/Session');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
  }

  try {
    // 1. Verify token signature
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 2. Check if the session was explicitly revoked or timed out
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const session = await Session.findOne({ tokenHash });

    if (session) {
      const isExpired = session.expiresAt && new Date(session.expiresAt) <= new Date();
      if (session.isRevoked || isExpired) {
        if (!session.isRevoked) {
          session.isRevoked = true;
          await session.save().catch(() => {});
        }
        return res.status(401).json({ 
          success: false, 
          error: 'Session has expired or was revoked. Please sign in again.' 
        });
      }

      // Update lastActive timestamp asynchronously
      session.lastActive = new Date();
      session.save().catch(() => {});
    }

    // 3. Find User or Student
    let user = await User.findById(decoded.id).populate('role');
    if (!user) {
      const student = await Student.findById(decoded.id);
      if (student && student.isActive) {
        user = {
          _id: student._id,
          username: student.studentId,
          role: 'Student',
          institutionId: student.institutionId,
          studentId: student.studentId,
          name: student.name,
          isActive: true
        };
      }
    }

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, error: 'User account is inactive or not found' });
    }

    req.user = user;

    // Zero-trust multi-tenant isolation
    const { enforceTenantIsolation } = require('./tenantMiddleware');
    enforceTenantIsolation(req, res, next);
  } catch (err) {
    // Automatically revoke session on expired/invalid token
    if (token) {
      try {
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        await Session.updateOne({ tokenHash }, { $set: { isRevoked: true } });
      } catch (_) {}
    }
    return res.status(401).json({ success: false, error: 'Session expired or invalid token' });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user?.role?.name || (typeof req.user?.role === 'string' ? req.user.role : '');
    
    // SuperAdmin (Platform) and Admin (Institution Admin / Principal) have universal access
    if (userRole === 'SuperAdmin' || userRole === 'Admin') {
      return next();
    }

    // Check if role has 'all' permissions granted in the database
    const permissions = req.user?.role?.permissions;
    if (permissions) {
      const allPerm = permissions instanceof Map ? permissions.get('all') : permissions.all;
      if (allPerm && (allPerm.read || allPerm.write)) {
        return next();
      }
    }

    if (!roles.includes(userRole)) {
      return res.status(403).json({ 
        success: false, 
        error: `User role '${userRole}' is not authorized to access this route`
      });
    }
    next();
  };
};
