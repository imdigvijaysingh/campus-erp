const express = require('express');
const { 
  getPayments, 
  addPayment, 
  getReceipt, 
  simulateOnlinePayment, 
  getFinanceStats,
  createRazorpayOrder,
  verifyRazorpayPayment
} = require('../controllers/feeController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Financial metrics & analytics
router.get('/stats', protect, authorize('SuperAdmin', 'Admin', 'FeeCashier'), getFinanceStats);

// Printable formal receipt
router.get('/receipt/:receiptNumber', protect, getReceipt);

// Razorpay Payment Gateway Endpoints (Authenticated)
router.post('/razorpay/order', protect, createRazorpayOrder);
router.post('/razorpay/verify', protect, verifyRazorpayPayment);

// Online payment simulation fallback (Authenticated)
router.post('/simulate-online', protect, simulateOnlinePayment);

// Standard payment endpoints
router.route('/')
  .get(protect, authorize('SuperAdmin', 'Admin', 'FeeCashier', 'Student'), getPayments)
  .post(protect, authorize('SuperAdmin', 'Admin', 'FeeCashier'), addPayment);

module.exports = router;

