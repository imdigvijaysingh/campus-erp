const AuditLog = require('../models/AuditLog');

// @desc    Get audit logs with tenant scoping and filtering
// @route   GET /api/v1/audit-logs
// @access  Private (Admin / SuperAdmin)
exports.getAuditLogs = async (req, res) => {
  try {
    const { riskLevel, action, resource, search, limit = 50, page = 1 } = req.query;

    const query = {};

    // Enforce Tenant Scope
    const isSuperAdmin = req.user?.role?.name === 'SuperAdmin';
    if (!isSuperAdmin) {
      query.institutionId = req.user.institutionId;
    } else if (req.query.institutionId) {
      query.institutionId = req.query.institutionId;
    }

    if (riskLevel) query.riskLevel = riskLevel;
    if (action) query.action = action;
    if (resource) query.resource = resource;

    if (search) {
      query.$or = [
        { details: { $regex: search, $options: 'i' } },
        { 'actor.username': { $regex: search, $options: 'i' } },
        { resource: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort('-timestamp')
        .skip(skip)
        .limit(parseInt(limit)),
      AuditLog.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: logs
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get security metrics & SOC summary
// @route   GET /api/v1/audit-logs/soc-metrics
// @access  Private (Admin / SuperAdmin)
exports.getSocMetrics = async (req, res) => {
  try {
    const isSuperAdmin = req.user?.role?.name === 'SuperAdmin';
    const match = isSuperAdmin ? {} : { institutionId: req.user.institutionId };

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [totalEvents, criticalCount, highRiskCount, failedLogins24h] = await Promise.all([
      AuditLog.countDocuments(match),
      AuditLog.countDocuments({ ...match, riskLevel: 'CRITICAL' }),
      AuditLog.countDocuments({ ...match, riskLevel: 'HIGH' }),
      AuditLog.countDocuments({ ...match, action: 'FAILED_LOGIN', timestamp: { $gte: oneDayAgo } })
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalEvents,
        criticalAlerts: criticalCount,
        highRiskAlerts: highRiskCount,
        failedLogins24h,
        systemsHealthyPercent: 99.4
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
