const express = require('express');
const router = express.Router();
const { createAssignment, getMyAssignments, getAllAssignments, deleteAssignment } = require('../controllers/assignmentController');
const { protect } = require('../middleware/authMiddleware');
const { protectStudent } = require('../middleware/studentAuthMiddleware');

router.post('/', protect, createAssignment); // Admin
router.get('/', protect, getAllAssignments); // Admin
router.delete('/:id', protect, deleteAssignment); // Admin
router.get('/my', protectStudent, getMyAssignments); // Student

module.exports = router;
