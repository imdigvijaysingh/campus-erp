const crypto = require('crypto');

/**
 * Enterprise Trace ID & Request Boundary Middleware
 * 
 * Enforces end-to-end observability, opaque error correlation,
 * and distributed request tracking across gateway, backend, and database tiers.
 */
const traceMiddleware = (req, res, next) => {
  // Use incoming client/gateway trace ID or generate a new cryptographically secure UUIDv4
  const traceId = req.headers['x-trace-id'] || crypto.randomUUID();
  req.traceId = traceId;

  // Echo trace ID on response header for client correlation
  res.setHeader('X-Trace-Id', traceId);
  res.setHeader('X-Content-Type-Options', 'nosniff');

  req.startTime = Date.now();

  next();
};

module.exports = traceMiddleware;
