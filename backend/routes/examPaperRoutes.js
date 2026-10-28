const express = require('express');
const router = express.Router();
const { 
  getExamPapers, 
  getExamPaperFilters, 
  createExamPaper,
  deleteExamPaper,
  incrementDownload
} = require('../controllers/examPaperController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/filters').get(protect, getExamPaperFilters);
router.route('/')
  .get(protect, getExamPapers)
  .post(protect, authorize('SuperAdmin', 'Admin', 'Teacher'), createExamPaper);

router.route('/:id').delete(protect, authorize('SuperAdmin', 'Admin', 'Teacher'), deleteExamPaper);
router.route('/:id/download').patch(protect, incrementDownload);

module.exports = router;
