/**
 * Tenant Isolation Middleware for Shyvora Multi-Tenant Architecture
 * Enforces zero-trust isolation between educational institutions.
 */

const enforceTenantIsolation = (req, res, next) => {
  if (!req.user) {
    req.tenantFilter = {};
    return next();
  }

  const roleName = req.user.role?.name || (typeof req.user.role === 'string' ? req.user.role : '');
  const isSuperAdmin = roleName === 'SuperAdmin';

  if (isSuperAdmin) {
    // SuperAdmin has cross-tenant capabilities; if an institutionId is provided in query, scope to it
    req.isSuperAdmin = true;
    req.tenantId = req.query.institutionId || req.body?.institutionId || null;
    req.tenantFilter = req.tenantId ? { institutionId: req.tenantId } : {};
    return next();
  }

  // Institutional Users (Admins, Teachers, Staff, Students) MUST be bound to their verified institution
  if (req.user.institutionId) {
    req.isSuperAdmin = false;
    req.tenantId = req.user.institutionId.toString();
    req.tenantFilter = { institutionId: req.user.institutionId };

    // Never trust client-supplied institutionId in body or query
    if (req.body && typeof req.body === 'object') {
      req.body.institutionId = req.user.institutionId;
    }
  } else {
    req.isSuperAdmin = false;
    req.tenantId = null;
    req.tenantFilter = {};
  }

  next();
};

module.exports = { enforceTenantIsolation };
