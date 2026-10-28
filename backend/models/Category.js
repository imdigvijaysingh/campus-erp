const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  institutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please add a category name'],
    unique: true
  },
  slug: {
    type: String,
    required: [true, 'Please add a slug'],
    unique: true,
    index: true
  },
  description: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Category', CategorySchema);
