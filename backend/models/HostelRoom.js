const mongoose = require('mongoose');

const HostelRoomSchema = new mongoose.Schema({
  institutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    required: true
  },
  roomNumber: {
    type: String,
    required: true,
    unique: true
  },
  block: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  occupancy: {
    type: Number,
    default: 0
  },
  feePerSemester: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('HostelRoom', HostelRoomSchema);
