const mongoose = require('mongoose');

const levelSchema = new mongoose.Schema({
  institutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    required: true
  },
  programId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Program',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please add a level name (e.g. Class 10, 2nd Year, Semester 3)'],
    trim: true
  },
  order: {
    type: Number, // Useful for ordering progression (e.g., 1 -> 2 -> 3)
    default: 1
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Level', levelSchema);
