const mongoose = require('mongoose');

const studentRiskSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    unique: true,
    index: true
  },
  studentId: {
    type: String,
    required: true,
    index: true
  },
  overallRiskScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 0
  },
  riskTier: {
    type: String,
    enum: ['HIGH', 'MODERATE', 'LOW'],
    default: 'LOW',
    index: true
  },
  factorBreakdown: {
    attendanceRisk: { type: Number, default: 0 }, // 35% weight
    academicRisk: { type: Number, default: 0 },   // 30% weight
    financialRisk: { type: Number, default: 0 },  // 20% weight
    engagementRisk: { type: Number, default: 0 }  // 15% weight
  },
  detentionAlert: {
    type: Boolean,
    default: false // True if attendance < 75% (UGC / CBSE threshold)
  },
  dropoutProbability: {
    type: Number,
    default: 0
  },
  primaryDrivers: [{
    type: String
  }],
  recommendedInterventions: [{
    category: {
      type: String,
      enum: ['PARENT_COMMUNICATION', 'REMEDIAL_COACHING', 'FEE_RESTRUCTURING', 'STUDENT_COUNSELING', 'ATTENDANCE_WARNING'],
      default: 'STUDENT_COUNSELING'
    },
    title: String,
    urgency: {
      type: String,
      enum: ['CRITICAL', 'HIGH', 'MODERATE', 'LOW'],
      default: 'HIGH'
    },
    actionSummary: String
  }],
  riskTrend: {
    type: String,
    enum: ['RISING', 'STABLE', 'IMPROVING'],
    default: 'STABLE'
  },
  scoreHistory: [{
    calculatedAt: { type: Date, default: Date.now },
    score: Number,
    tier: String
  }],
  lastCalculatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('StudentRisk', studentRiskSchema);
