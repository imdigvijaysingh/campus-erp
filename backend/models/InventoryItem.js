const mongoose = require('mongoose');

const InventoryItemSchema = new mongoose.Schema({
  institutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    required: true
  },
  itemName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Stationery', 'Lab Equipment', 'Furniture', 'Electronics', 'Sports', 'Other'],
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    default: 'pcs'
  },
  location: {
    type: String
  },
  pricePerUnit: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('InventoryItem', InventoryItemSchema);
