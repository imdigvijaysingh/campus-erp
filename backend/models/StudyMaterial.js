const mongoose = require('mongoose');

const studyMaterialSchema = new mongoose.Schema({
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
  type: {
    type: String,
    enum: ['pdf', 'video', 'youtube'],
    required: true
  },
  url: {
    type: String,
    required: true // File URL or YouTube link
  },
  thumbnailUrl: {
    type: String // Auto-fetched for youtube, or uploaded for others
  },
  targetClass: {
    type: String,
    required: true // e.g., 'B.Tech CSE - 6th Sem'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('StudyMaterial', studyMaterialSchema);
