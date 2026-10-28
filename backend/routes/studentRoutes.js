const express = require('express');
const router = express.Router();
const {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  authStudent,
  getStudentProfile,
  updateStudentProfileSelf,
  registerStudent,
  createBulkStudents,
  revealApaarId,
  syncAbcCredits,
  batchPromoteStudents
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { protectStudent } = require('../middleware/studentAuthMiddleware');

// Student facing routes
router.post('/login', authStudent);
router.post('/signup', registerStudent);
router.route('/me')
  .get(protectStudent, getStudentProfile)
  .put(protectStudent, updateStudentProfileSelf);

// NCrF & APAAR ID Security & ABC Bank Sync (Restricted to Authorized Admins)
router.post('/:id/reveal-apaar', protect, authorize('SuperAdmin', 'Admin'), revealApaarId);
router.post('/:id/sync-abc', protect, authorize('SuperAdmin', 'Admin'), syncAbcCredits);

// Admin routes - Strict RBAC
router.route('/')
  .get(protect, authorize('SuperAdmin', 'Admin', 'Staff', 'Faculty'), getStudents)
  .post(protect, authorize('SuperAdmin', 'Admin'), createStudent);

router.post('/bulk', protect, authorize('SuperAdmin', 'Admin'), createBulkStudents);
router.post('/batch-promote', protect, authorize('SuperAdmin', 'Admin'), batchPromoteStudents);

router.route('/:id')
  .put(protect, authorize('SuperAdmin', 'Admin'), updateStudent)
  .delete(protect, authorize('SuperAdmin', 'Admin'), deleteStudent);

module.exports = router;
