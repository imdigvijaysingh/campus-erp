const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  institutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    required: true
  },
  levelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Level',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please add a section name (e.g. Section A, Morning Batch)'],
    trim: true
  },
  capacity: {
    type: Number,
    default: 50
  },
  classTeacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Section', sectionSchema);
