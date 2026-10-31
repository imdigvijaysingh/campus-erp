/**
 * Enterprise Cyber-Resilience & Fail-Secure Architecture Middleware
 * 
 * Provides proactive Out-of-Memory (OOM) load-shedding, context call budgets (timeouts),
 * opaque trace-id correlation, and fail-secure crash containment.
 */

const v8 = require('v8');
const crypto = require('crypto');

// Configurable thresholds (default: shed load at 85% V8 heap capacity)
const HEAP_CRITICAL_THRESHOLD_PERCENT = 85; 

/**
 * Returns current memory health metrics
 */
const getMemoryMetrics = () => {
  const heapStats = v8.getHeapStatistics();
  const memUsage = process.memoryUsage();
  
  const heapLimit = heapStats.heap_size_limit;
  const heapUsed = memUsage.heapUsed;
  const usagePercentage = Math.round((heapUsed / heapLimit) * 100);

  return {
    rssMB: Math.round(memUsage.rss / 1024 / 1024),
    heapTotalMB: Math.round(memUsage.heapTotal / 1024 / 1024),
    heapUsedMB: Math.round(heapUsed / 1024 / 1024),
    heapLimitMB: Math.round(heapLimit / 1024 / 1024),
    usagePercentage,
    isCritical: usagePercentage >= HEAP_CRITICAL_THRESHOLD_PERCENT
  };
};

/**
 * Memory Cushion & Load-Shedding Circuit Breaker Middleware
 * 
 * If the V8 heap is dangerously close to exhaustion (>= 85%),
 * fast-rejects incoming non-healthcheck requests with HTTP 503.
 * This guarantees the server retains a "Memory Cushion" to:
 * 1. Allow in-flight database transactions to commit or rollback cleanly.
 * 2. Prevent unhandled V8 SIGABRT crashes.
 * 3. Stop attackers from exploiting the crash downtime window.
 */
const memoryCushionGuard = (req, res, next) => {
  // Always permit health checks and ping requests so orchestrators know the process is alive
  if (req.path === '/health' || req.path === '/api/v1/health' || req.path === '/ping') {
    return next();
  }

  const metrics = getMemoryMetrics();

  if (metrics.isCritical) {
    const traceId = req.traceId || crypto.randomUUID();
    console.error(`[RESILIENCE ALERT] Critical memory pressure detected: ${metrics.usagePercentage}% heap used (${metrics.heapUsedMB}MB / ${metrics.heapLimitMB}MB). Shedding load to protect active transactions. Trace: ${traceId}`);
    
    // Attempt voluntary garbage collection if node is run with --expose-gc
    if (typeof global.gc === 'function') {
      try {
        global.gc();
      } catch (e) {
        // Ignore GC invocation errors
      }
    }

    res.set('Retry-After', '5');
    return res.status(503).json({
      status: 503,
      code: 'SERVICE_OVERLOADED',
      message: 'Server is operating under high memory pressure. Load shedding is active to guarantee data integrity. Please retry in 5 seconds.',
      traceId,
      incidentTimestamp: new Date().toISOString()
    });
  }

  next();
};

/**
 * Context Call Budget / Deadline Middleware (Workstream 0.2)
 * Enforces resilient 30000ms application API handler execution budget.
 */
const apiTimeoutGuard = (timeoutMs = 30000) => {
  return (req, res, next) => {
    // Health checks and ping endpoints bypass timeout
    if (req.path === '/health' || req.path === '/api/v1/health' || req.path === '/ping') {
      return next();
    }

    const timer = setTimeout(() => {
      if (!res.headersSent) {
        const traceId = req.traceId || crypto.randomUUID();
        console.warn(`[TIMEOUT GUARD] Request exceeded context call budget of ${timeoutMs}ms: ${req.method} ${req.originalUrl} (Trace: ${traceId})`);
        
        res.status(504).json({
          status: 504,
          code: 'GATEWAY_TIMEOUT',
          message: 'Server took too long to respond. Please check your connection and try again.',
          traceId
        });
      }
    }, timeoutMs);

    res.on('finish', () => clearTimeout(timer));
    res.on('close', () => clearTimeout(timer));

    next();
  };
};

/**
 * Global Fatal Crash Containment Handler (Workstream 0.1)
 */
const handleFatalCrash = async (err, req = null, res = null) => {
  const traceId = req?.traceId || crypto.randomUUID();
  console.error(JSON.stringify({
    level: 'FATAL',
    timestamp: new Date().toISOString(),
    traceId,
    error: err?.message || String(err),
    stack: process.env.NODE_ENV === 'production' ? null : err?.stack
  }));

  if (res && !res.headersSent) {
    res.status(500).json({
      status: 500,
      code: 'INTERNAL_FAULT',
      message: 'An unexpected system fault occurred. Our engineering operations team has been notified.',
      traceId
    });
  }

  // Trigger clean resource disposal
  try {
    const mongoose = require('mongoose');
    if (mongoose?.connection?.readyState !== 0) {
      await mongoose.connection.close(false);
      console.log(`[FATAL CRASH HANDLER ${traceId}] Database connections terminated cleanly.`);
    }
  } catch (_) {}

  process.exit(1);
};

/**
 * Attach fail-secure process exception traps to a running HTTP server
 */
const attachFailSecureProcessHandlers = (server, mongoose) => {
  let isShuttingDown = false;

  const gracefulFailSecureShutdown = async (signal, error) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    const incidentId = 'INC-' + Date.now().toString(36).toUpperCase();
    console.error(`[FATAL RESILIENCE TRAP ${incidentId}] Triggered by ${signal}:`, error ? (error.stack || error.message || error) : 'External signal');

    // 1. Immediately stop accepting new connections
    if (server && server.close) {
      server.close(() => {
        console.log(`[FATAL RESILIENCE TRAP ${incidentId}] HTTP listener closed.`);
      });
    }

    // 2. Safely close database connections to prevent corrupted in-flight states
    if (mongoose && mongoose.connection && mongoose.connection.readyState !== 0) {
      try {
        await mongoose.connection.close(false);
        console.log(`[FATAL RESILIENCE TRAP ${incidentId}] Database connections terminated cleanly.`);
      } catch (dbErr) {
        console.error(`[FATAL RESILIENCE TRAP ${incidentId}] Failed to cleanly close DB:`, dbErr.message);
      }
    }

    // 3. Exit with non-zero code so process orchestrators (PM2, Docker, K8s) restart worker cleanly
    setTimeout(() => {
      process.exit(1);
    }, 1500).unref();
  };

  process.on('uncaughtException', (err) => {
    gracefulFailSecureShutdown('uncaughtException', err);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('[UNHANDLED REJECTION DETECTED]', reason);
    if (process.env.NODE_ENV === 'production') {
      // In strict zero-crash resilience mode, treat fatal unhandled promise rejections as critical
      gracefulFailSecureShutdown('unhandledRejection', reason);
    }
  });

  process.on('SIGTERM', () => {
    gracefulFailSecureShutdown('SIGTERM');
  });

  process.on('SIGINT', () => {
    gracefulFailSecureShutdown('SIGINT');
  });
};

module.exports = {
  getMemoryMetrics,
  memoryCushionGuard,
  apiTimeoutGuard,
  handleFatalCrash,
  attachFailSecureProcessHandlers
};
