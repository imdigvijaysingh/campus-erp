const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  institutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    default: null
  },
  tokenHash: {
    type: String,
    required: true,
    index: true
  },
  deviceInfo: {
    browser: { type: String, default: 'Chrome' },
    os: { type: String, default: 'Windows' },
    device: { type: String, default: 'Desktop' },
    rawUserAgent: { type: String, default: '' }
  },
  ip: {
    type: String,
    default: '127.0.0.1'
  },
  location: {
    type: String,
    default: 'Local Network'
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  isRevoked: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 } // TTL index automatically cleans expired sessions
  }
}, {
  timestamps: true
});

SessionSchema.index({ userId: 1, isRevoked: 1 });

module.exports = mongoose.model('Session', SessionSchema);
