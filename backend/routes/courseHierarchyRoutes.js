const express = require('express');
const {
  getHierarchies,
  getHierarchy,
  createHierarchy,
  updateHierarchy,
  deleteHierarchy
} = require('../controllers/courseHierarchyController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router
  .route('/')
  .get(getHierarchies)
  .post(protect, authorize('SuperAdmin', 'Admin', 'AcademicDean'), createHierarchy);

router
  .route('/:id')
  .get(getHierarchy)
  .put(protect, authorize('SuperAdmin', 'Admin', 'AcademicDean'), updateHierarchy)
  .delete(protect, authorize('SuperAdmin', 'Admin', 'AcademicDean'), deleteHierarchy);

module.exports = router;
