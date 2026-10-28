const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a role name'],
    unique: true,
    trim: true
  },
  institutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution' // Null means global role like SuperAdmin
  },
  description: {
    type: String,
    default: ''
  },
  permissions: {
    type: Map,
    of: new mongoose.Schema({
      read: { type: Boolean, default: false },
      write: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    }, { _id: false }),
    default: {}
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Role', RoleSchema);
