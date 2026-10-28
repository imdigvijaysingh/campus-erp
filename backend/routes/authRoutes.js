const express = require('express');
const { 
  register, 
  login, 
  getMe, 
  updateCredentials, 
  getUsersCount,
  getSessions,
  revokeSession,
  revokeAllOtherSessions
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');
const User = require('../models/User');

const router = express.Router();

// Enforce admin authorization on user registration; allow initial bootstrap if no users exist
const requireAdminRegistration = async (req, res, next) => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      return next(); // Initial system bootstrap
    }
    return protect(req, res, () => {
      authorize('SuperAdmin', 'Admin')(req, res, next);
    });
  } catch (err) {
    return next(err);
  }
};

router.post('/register', requireAdminRegistration, register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateCredentials);
router.get('/users/count', protect, getUsersCount);

// Device Session Registry & Revocation
router.get('/sessions', protect, getSessions);
router.post('/sessions/revoke/:id', protect, revokeSession);
router.post('/sessions/revoke-all', protect, revokeAllOtherSessions);

module.exports = router;
