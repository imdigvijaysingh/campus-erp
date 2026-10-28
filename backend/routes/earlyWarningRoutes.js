const express = require('express');
const router = express.Router();
const {
  getEarlyWarningSummary,
  getAtRiskStudents,
  getStudentRiskDiagnosis,
  createIntervention,
  updateInterventionStatus,
  recalculateRiskScores
} = require('../controllers/earlyWarningController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Enforce staff/faculty/admin authorization across all early warning & risk analytics routes
router.use(protect);
router.use(authorize('SuperAdmin', 'Admin', 'Staff', 'Faculty'));

router.get('/summary', getEarlyWarningSummary);
router.get('/students', getAtRiskStudents);
router.get('/students/:id', getStudentRiskDiagnosis);
router.post('/interventions', createIntervention);
router.patch('/interventions/:id', updateInterventionStatus);
router.post('/recalculate', recalculateRiskScores);

module.exports = router;
