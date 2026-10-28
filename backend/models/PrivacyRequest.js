const mongoose = require('mongoose');

const PrivacyRequestSchema = new mongoose.Schema({
  institutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['ACCESS', 'CORRECTION', 'DELETION', 'CONSENT_WITHDRAWAL', 'PORTABILITY']
  },
  requester: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, default: 'Student' },
    isMinor: { type: Boolean, default: false },
    guardianName: { type: String, default: '' }
  },
  status: {
    type: String,
    enum: ['PENDING', 'IN_REVIEW', 'APPROVED', 'COMPLETED', 'REJECTED'],
    default: 'PENDING'
  },
  details: {
    type: String,
    required: true
  },
  resolutionNotes: {
    type: String,
    default: ''
  },
  dueBy: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days statutory window under DPDP
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PrivacyRequest', PrivacyRequestSchema);
