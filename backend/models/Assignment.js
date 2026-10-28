const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  institutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  fileUrl: {
    type: String,
    required: true // URL to PDF
  },
  targetClass: {
    type: String,
    required: true // e.g., 'B.Tech CSE - 6th Sem'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Assignment', assignmentSchema);
