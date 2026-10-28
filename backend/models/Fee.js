const mongoose = require('mongoose');

const feeBreakdownSchema = new mongoose.Schema({
  head: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

const feePaymentSchema = new mongoose.Schema({
  institutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    required: false
  },
  studentId: {
    type: String,
    required: true,
    trim: true
  },
  studentName: {
    type: String,
    trim: true,
    default: ''
  },
  programCourse: {
    type: String,
    trim: true,
    default: ''
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  feeCategory: {
    type: String,
    default: 'Tuition Fee',
    trim: true
  },
  breakdown: [feeBreakdownSchema],
  scholarship: {
    name: { type: String, default: '' },
    amount: { type: Number, default: 0 }
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  paymentMethod: {
    type: String,
    default: 'Cash',
    trim: true
  },
  transactionId: {
    type: String,
    trim: true,
    default: ''
  },
  receiptNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['COMPLETED', 'PENDING', 'FAILED', 'REFUNDED'],
    default: 'COMPLETED'
  },
  collectedBy: {
    type: String,
    default: 'Cashier'
  },
  remarks: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Indexing for rapid queries
feePaymentSchema.index({ studentId: 1, paymentDate: -1 });
feePaymentSchema.index({ institutionId: 1, paymentDate: -1 });

module.exports = mongoose.model('FeePayment', feePaymentSchema);
