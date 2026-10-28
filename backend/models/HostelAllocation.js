const mongoose = require('mongoose');

const HostelAllocationSchema = new mongoose.Schema({
  institutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HostelRoom',
    required: true
  },
  allocationDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Active', 'Vacated'],
    default: 'Active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('HostelAllocation', HostelAllocationSchema);
