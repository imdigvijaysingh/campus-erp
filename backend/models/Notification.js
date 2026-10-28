const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  institutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  targetType: {
    type: String,
    enum: ['all', 'class', 'student'],
    required: true
  },
    targetId: {
      type: String, // Can be studentId (e.g. '12345') or className (e.g. 'B.Tech CSE - 3rd Year') or empty if 'all'
      default: ''
    },
    actionTab: {
      type: String,
      default: 'notifications'
    }
  }, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
