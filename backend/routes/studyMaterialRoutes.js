const express = require('express');
const router = express.Router();
const { createStudyMaterial, getMyStudyMaterials, getAllStudyMaterials, deleteStudyMaterial } = require('../controllers/studyMaterialController');
const { protect } = require('../middleware/authMiddleware');
const { protectStudent } = require('../middleware/studentAuthMiddleware');

router.post('/', protect, createStudyMaterial); // Admin
router.get('/', protect, getAllStudyMaterials); // Admin
router.delete('/:id', protect, deleteStudyMaterial); // Admin
router.get('/my', protectStudent, getMyStudyMaterials); // Student

module.exports = router;
