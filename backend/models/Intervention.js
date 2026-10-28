const mongoose = require('mongoose');

const interventionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    index: true
  },
  studentId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['PARENT_COMMUNICATION', 'REMEDIAL_COACHING', 'FEE_RESTRUCTURING', 'STUDENT_COUNSELING', 'ATTENDANCE_WARNING'],
    default: 'STUDENT_COUNSELING'
  },
  channel: {
    type: String,
    enum: ['WHATSAPP', 'PHONE_CALL', 'IN_PERSON_MEETING', 'OFFICIAL_LETTER', 'SYSTEM_NOTIFICATION'],
    default: 'WHATSAPP'
  },
  urgency: {
    type: String,
    enum: ['CRITICAL', 'HIGH', 'MODERATE', 'LOW'],
    default: 'HIGH'
  },
  status: {
    type: String,
    enum: ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'ESCALATED'],
    default: 'PENDING',
    index: true
  },
  assignedTo: {
    type: String,
    default: 'Academic Counselor / HOD'
  },
  createdBy: {
    type: String,
    default: 'SuperAdmin'
  },
  notes: {
    type: String,
    default: ''
  },
  resolutionNotes: {
    type: String,
    default: ''
  },
  resolvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Intervention', interventionSchema);
