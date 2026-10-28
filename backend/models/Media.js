const mongoose = require('mongoose');

const MediaSchema = new mongoose.Schema({
  institutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    required: true
  },
  filename: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  mimetype: {
    type: String,
  },
  size: {
    type: Number,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  category: {
    type: String,
    default: 'general',
    trim: true
  }
});

module.exports = mongoose.model('Media', MediaSchema);
