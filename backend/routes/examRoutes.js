const express = require('express');
const {
  getExamSchedules,
  createExamSchedule,
  updateExamSchedule,
  deleteExamSchedule,
  getStudentHallTicket,
  saveStudentAssessment,
  getStudentAssessments,
  getExamStats
} = require('../controllers/examController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Executive examination statistics (Authorized Staff/Admin only)
router.get('/stats', protect, authorize('SuperAdmin', 'Admin', 'Teacher'), getExamStats);

// Dynamic Hall Ticket evaluation and retrieval
router.get('/hall-ticket', protect, getStudentHallTicket);

// Student Assessment & Grade Card endpoints
router.route('/assessments')
  .get(protect, getStudentAssessments)
  .post(protect, authorize('SuperAdmin', 'Admin', 'Teacher'), saveStudentAssessment);

// Exam Schedules & Timetables
router.route('/schedules')
  .get(protect, getExamSchedules)
  .post(protect, authorize('SuperAdmin', 'Admin'), createExamSchedule);

router.route('/schedules/:id')
  .put(protect, authorize('SuperAdmin', 'Admin'), updateExamSchedule)
  .delete(protect, authorize('SuperAdmin', 'Admin'), deleteExamSchedule);

module.exports = router;
