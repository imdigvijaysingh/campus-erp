const AuditLog = require('../models/AuditLog');
const Activity = require('../models/Activity');

/**
 * Universal Audit Logger for Security, DPDP & CERT-In Compliance
 */
const logAuditEvent = async (req, {
  action = 'ACCESS',
  resource = 'General',
  resourceId = null,
  details = '',
  diff = [],
  riskLevel = 'LOW'
} = {}) => {
  try {
    const user = req?.user || {};
    const username = user.username || 'Anonymous';
    const role = user.role?.name || (typeof user.role === 'string' ? user.role : 'System');
    const institutionId = user.institutionId || req?.tenantId || null;

    const ip = req?.headers?.['x-forwarded-for']?.split(',')[0]?.trim() || 
               req?.socket?.remoteAddress || 
               req?.ip || 
               '127.0.0.1';

    const userAgent = req?.headers?.['user-agent'] || 'Unknown Client';
    const route = req?.originalUrl || req?.url || 'Unknown';
    const method = req?.method || 'N/A';

    // 1. Write immutable AuditLog
    await AuditLog.create({
      actor: {
        userId: user._id || null,
        username,
        role
      },
      institutionId,
      action,
      resource,
      resourceId: resourceId ? String(resourceId) : null,
      details: details || `${username} performed ${action} on ${resource}`,
      diff,
      metadata: {
        ip,
        userAgent,
        route,
        method
      },
      riskLevel,
      timestamp: new Date()
    });

    // 2. Also record in legacy Activity for existing UI backward-compatibility
    const mappedAction = action === 'CREATE' ? 'Created' :
                         action === 'UPDATE' ? 'Updated' :
                         action === 'DELETE' ? 'Deleted' :
                         action === 'LOGIN' ? 'Logged In' : 'Added';

    if (institutionId) {
      await Activity.create({
        institutionId,
        action: mappedAction,
        entity: resource,
        details: details || `${action} on ${resource}`,
        user: username
      }).catch(() => {});
    }
  } catch (error) {
    console.error('Audit Logging Error (non-blocking):', error.message);
  }
};

module.exports = logAuditEvent;
