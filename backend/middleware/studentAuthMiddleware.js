const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

const protectStudent = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Decode token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find student and attach to req
      req.student = await Student.findById(decoded.id).select('-password');

      if (!req.student) {
        const User = require('../models/User');
        const user = await User.findById(decoded.id);
        if (user && user.studentProfile) {
          req.student = await Student.findById(user.studentProfile).select('-password');
        }
      }

      if (!req.student) {
        return res.status(401).json({ message: 'Not authorized, student not found' });
      }

      if (!req.student.isActive) {
        return res.status(401).json({ message: 'Account is deactivated. Contact admin.' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protectStudent };
