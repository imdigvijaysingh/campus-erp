const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  actor: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: {
      type: String,
      required: true,
      default: 'System'
    },
    role: {
      type: String,
      default: 'Unknown'
    }
  },
  institutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    default: null
  },
  action: {
    type: String,
    required: true,
    enum: ['CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'LOGIN', 'FAILED_LOGIN', 'REVOKE', 'SECURITY_ALERT', 'ACCESS']
  },
  resource: {
    type: String,
    required: true
  },
  resourceId: {
    type: String,
    default: null
  },
  details: {
    type: String,
    required: true
  },
  diff: [
    {
      field: String,
      before: mongoose.Schema.Types.Mixed,
      after: mongoose.Schema.Types.Mixed
    }
  ],
  metadata: {
    ip: String,
    userAgent: String,
    route: String,
    method: String
  },
  riskLevel: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'LOW'
  },
  timestamp: {
    type: Date,
    default: Date.now,
    immutable: true // Ensure logs cannot be altered after insertion
  }
}, {
  timestamps: false // Use explicit immutable timestamp
});

// Indexing for high-speed SOC and compliance queries
AuditLogSchema.index({ institutionId: 1, timestamp: -1 });
AuditLogSchema.index({ riskLevel: 1, timestamp: -1 });
AuditLogSchema.index({ 'actor.username': 1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
