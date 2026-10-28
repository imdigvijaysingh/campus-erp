/**
 * Split-Brain Quorum & Minority Partition Guard (Workstream 4.2)
 * 
 * Enforces Consistency over Availability (C over A):
 * When database connectivity drops, replica sets failover, or minority partition status is detected,
 * all state mutations (POST, PUT, PATCH, DELETE) are locked into fail-secure read-only mode.
 */

const mongoose = require('mongoose');

let isMinorityPartitionLocked = false;

/**
 * Programmatic toggle for read-only safeguard override
 */
const setQuorumLock = (locked) => {
  isMinorityPartitionLocked = !!locked;
  console.log(`[QUORUM GUARD] Split-brain protection lock status updated: ${isMinorityPartitionLocked ? 'LOCKED (READ-ONLY)' : 'ACTIVE (READ-WRITE)'}`);
};

const isWritePermitted = () => {
  // If explicitly locked by network partition monitor
  if (isMinorityPartitionLocked) return false;

  // Verify database connection is healthy and connected (readyState === 1)
  if (mongoose.connection.readyState !== 1) {
    return false;
  }

  return true;
};

const enforceQuorumGuard = (req, res, next) => {
  const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);

  if (!isMutation) {
    return next();
  }

  // Exempt keepalive / health checks if needed
  if (req.path.startsWith('/health') || req.path.startsWith('/ping')) {
    return next();
  }

  if (!isWritePermitted()) {
    const traceId = req.traceId || 'N/A';
    console.error(`[QUORUM GUARD] Write mutation rejected due to split-brain or degraded database quorum: ${req.method} ${req.originalUrl} (Trace: ${traceId})`);

    return res.status(503).json({
      status: 503,
      code: 'CONSISTENCY_LOCK_ACTIVE',
      message: 'System is operating under partition or minority quorum protection. State mutations are temporarily locked to preserve zero data loss (RPO=0).',
      traceId,
      timestamp: new Date().toISOString()
    });
  }

  next();
};

module.exports = {
  enforceQuorumGuard,
  setQuorumLock,
  isWritePermitted
};
