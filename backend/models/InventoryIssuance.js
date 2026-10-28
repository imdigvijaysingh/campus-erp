const mongoose = require('mongoose');

const InventoryIssuanceSchema = new mongoose.Schema({
  institutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    required: true
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InventoryItem',
    required: true
  },
  issuedTo: {
    type: String,
    required: true
  },
  department: {
    type: String
  },
  quantityIssued: {
    type: Number,
    required: true,
    min: 1
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Issued', 'Returned', 'Consumed'],
    default: 'Issued'
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('InventoryIssuance', InventoryIssuanceSchema);
