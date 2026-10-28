const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  institutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    required: true
  },
  levelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Level' // Optional: some subjects might apply to multiple levels or just a specific level
  },
  name: {
    type: String,
    required: [true, 'Please add a subject name (e.g. Mathematics, Physics 101)'],
    trim: true
  },
  code: {
    type: String,
    trim: true
  },
  credits: {
    type: Number,
    default: 1
  },
  type: {
    type: String,
    enum: ['theory', 'practical', 'both'],
    default: 'theory'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Subject', subjectSchema);
