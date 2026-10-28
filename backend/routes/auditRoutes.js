const express = require('express');
const { getAuditLogs, getSocMetrics } = require('../controllers/auditController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Enforce admin authorization on system audit logs & security operations center metrics
router.use(protect);
router.use(authorize('SuperAdmin', 'Admin'));

router.get('/', getAuditLogs);
router.get('/soc-metrics', getSocMetrics);

module.exports = router;
