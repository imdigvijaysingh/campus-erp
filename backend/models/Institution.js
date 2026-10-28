const mongoose = require('mongoose');

const institutionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add an institution name'],
    trim: true
  },
  type: {
    type: String,
    enum: ['school', 'college', 'university', 'tuition_center'],
    required: true
  },
  contactEmail: {
    type: String,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  contactPhone: {
    type: String
  },
  address: {
    type: String
  },
  logo: {
    type: String
  },
  settings: {
    enableHostel: { type: Boolean, default: false },
    enableTransport: { type: Boolean, default: false },
    enableLibrary: { type: Boolean, default: false },
    enableAlumni: { type: Boolean, default: false }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Institution', institutionSchema);
