const express = require('express');
const router = express.Router();
const { getStudentsByClass, bulkUpdateAttendance } = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');

router.get('/students', protect, getStudentsByClass); // Admin
router.put('/bulk', protect, bulkUpdateAttendance); // Admin

module.exports = router;
