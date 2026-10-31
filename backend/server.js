const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
// const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const connectDB = require('./config/db');

const mongoose = require('mongoose');
const { memoryCushionGuard, attachFailSecureProcessHandlers, getMemoryMetrics } = require('./middleware/resilienceMiddleware');

// Load env vars
dotenv.config();

// Connect to database
connectDB(); // Uncomment when MongoDB is running

const app = express();

// Distributed Trace ID Tracking & Ingress Header Injection (Phase 0 Workstream 0.1)
const traceMiddleware = require('./middleware/traceMiddleware');
app.use(traceMiddleware);

// Context Deadline Call Budget (30s API Handler Budget)
const { apiTimeoutGuard } = require('./middleware/resilienceMiddleware');
app.use(apiTimeoutGuard(30000));

// Split-Brain Quorum & Network Partition Lock (Phase 4 Workstream 4.2)
const { enforceQuorumGuard } = require('./middleware/quorumGuard');
app.use(enforceQuorumGuard);

// Proactive Memory Cushion & Load-Shedding Circuit Breaker (OOM Armor)
app.use(memoryCushionGuard);

// Enable CORS with Trace-ID header exposure
app.use(cors({
  exposedHeaders: ['X-Trace-Id', 'Retry-After']
}));

// HTTP request logging (only in development or if explicitly needed)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Security Middlewares & Transport Hardening (Phase 1)
app.use(helmet({
  crossOriginResourcePolicy: false, // Allow cross-origin images/resources
  hsts: {
    maxAge: 63072000, // 2 Years HSTS
    includeSubDomains: true,
    preload: true
  },
  frameguard: { action: 'deny' },
  noSniff: true
}));

// Body Parser with safe payload limit (prevents memory ballooning & ReDoS attacks)
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

// Prevent XSS attacks
// app.use(xss()); // Commented out due to compatibility issues with Node 22 (Cannot set property query of #<IncomingMessage>)

// Sanitize data (prevent NoSQL injection - compatible with Node 20+ and Node 22)
app.use((req, res, next) => {
  const sanitize = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    for (const key of Object.keys(obj)) {
      if (key.startsWith('$') || key.includes('.')) {
        delete obj[key];
      } else if (typeof obj[key] === 'object') {
        sanitize(obj[key]);
      }
    }
  };

  if (req.body) sanitize(req.body);
  if (req.params) sanitize(req.params);
  if (req.query) sanitize(req.query);
  next();
});

// Rate limiting (Login)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login requests per windowMs
  message: 'Too many login attempts from this IP, please try again after 15 minutes'
});
app.use('/api/v1/auth/login', loginLimiter);

// General rate limiting for other API routes
const apiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 1000 // Limit each IP to 1000 requests per windowMs
});
app.use('/api/', apiLimiter);


// Set static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes (to be mounted)
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/students', require('./routes/studentRoutes'));
app.use('/api/v1/media', require('./routes/uploadRoutes'));
app.use('/api/v1/activities', require('./routes/activityRoutes'));
app.use('/api/v1/notifications', require('./routes/notificationRoutes'));
app.use('/api/v1/assignments', require('./routes/assignmentRoutes'));
app.use('/api/v1/study-materials', require('./routes/studyMaterialRoutes'));
app.use('/api/v1/courses', require('./routes/courseHierarchyRoutes'));
app.use('/api/v1/courses-hierarchy', require('./routes/courseHierarchyRoutes'));
app.use('/api/v1/users', require('./routes/userRoutes'));
app.use('/api/v1/attendance', require('./routes/attendanceRoutes'));
app.use('/api/v1/library', require('./routes/libraryRoutes'));
app.use('/api/v1/fees', require('./routes/feeRoutes'));
app.use('/api/v1/tickets', require('./routes/ticketRoutes'));
app.use('/api/v1/settings', require('./routes/settingRoutes'));
app.use('/api/v1/syllabus', require('./routes/syllabusRoutes'));
app.use('/api/v1/exam-papers', require('./routes/examPaperRoutes'));
app.use('/api/v1/exams', require('./routes/examRoutes'));
app.use('/api/v1/staff', require('./routes/staffRoutes'));
app.use('/api/v1/inventory', require('./routes/inventoryRoutes'));
app.use('/api/v1/facility', require('./routes/facilityRoutes'));
app.use('/api/v1/roles', require('./routes/roleRoutes'));
app.use('/api/v1/audit-logs', require('./routes/auditRoutes'));
app.use('/api/v1/privacy', require('./routes/privacyRoutes'));
app.use('/api/v1/early-warning', require('./routes/earlyWarningRoutes'));

// Health check / Keep-Alive Ping endpoint for Render, UptimeRobot, and cron monitors
app.get(['/health', '/api/v1/health', '/ping'], (req, res) => {
  const memory = getMemoryMetrics();
  res.status(200).json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    memory: {
      heapUsedMB: memory.heapUsedMB,
      heapLimitMB: memory.heapLimitMB,
      usagePercentage: `${memory.usagePercentage}%`,
      status: memory.isCritical ? 'CRITICAL_PRESSURE' : 'HEALTHY'
    },
    timestamp: new Date().toISOString(),
    service: 'Shyvora Backend'
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Shyvora CMS API',
    status: 'online',
    timestamp: new Date().toISOString()
  });
});

// 404 Not Found Catch-All (Phase 0 Workstream 0.1)
app.use((req, res) => {
  res.status(404).json({
    status: 404,
    code: 'NOT_FOUND',
    message: `Endpoint not found: ${req.method} ${req.originalUrl}`,
    traceId: req.traceId
  });
});

// Fail-Secure Error Handling Middleware (Phase 0 Workstream 0.1)
app.use((err, req, res, next) => {
  const traceId = req.traceId || crypto.randomUUID();
  const statusCode = err.status || err.statusCode || 500;

  // Structured security audit log for internal operations
  console.error(JSON.stringify({
    level: statusCode >= 500 ? 'FATAL' : 'WARN',
    timestamp: new Date().toISOString(),
    traceId,
    statusCode,
    path: req.originalUrl,
    method: req.method,
    ip: req.ip,
    errorMessage: err.message,
    errorCode: err.code || 'INTERNAL_FAULT',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  }));

  if (!res.headersSent) {
    res.status(statusCode).json({
      status: statusCode,
      code: err.code || (statusCode >= 500 ? 'INTERNAL_FAULT' : 'REQUEST_ERROR'),
      message: process.env.NODE_ENV === 'production' && statusCode >= 500
        ? 'An unexpected system fault occurred. Our engineering operations team has been notified.'
        : err.message,
      traceId
    });
  }
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  // Start Render self-keep-alive service
  const startKeepAlive = require('./utils/keepAlive');
  startKeepAlive();
});

// Attach Fail-Secure Process Traps (SIGTERM, SIGINT, UncaughtException)
attachFailSecureProcessHandlers(server, mongoose);
