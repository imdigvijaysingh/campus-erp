const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
  institutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    required: true
  },
  siteName: {
    type: String,
    default: 'My CMS Site'
  },
  siteLogo: {
    type: String
  },
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  contactEmail: {
    type: String
  },
  alumniFormUrl: {
    type: String,
    default: 'https://docs.google.com/forms'
  },
  jobFairFormUrl: {
    type: String,
    default: 'https://docs.google.com/forms'
  },
  academicCalendarUrl: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Setting', SettingSchema);
