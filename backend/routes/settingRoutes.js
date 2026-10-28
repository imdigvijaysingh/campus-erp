const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getSettings)
  .post(protect, authorize('SuperAdmin', 'Admin'), updateSettings);

module.exports = router;
