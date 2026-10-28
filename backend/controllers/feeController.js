const FeePayment = require('../models/Fee');
const Student = require('../models/Student');
const logActivity = require('../utils/logger');
const Notification = require('../models/Notification');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    throw new Error('Razorpay credentials are not configured on server. Please check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env');
  }
  return new Razorpay({ key_id, key_secret });
};

// @desc    Record a new fee payment (Admin / Cashier)
// @route   POST /api/v1/fees
// @access  Private (SuperAdmin, Admin, FeeCashier)
exports.addPayment = async (req, res) => {
  try {
    const { 
      studentId, 
      amount, 
      paymentMethod = 'Cash', 
      feeCategory = 'Tuition Fee', 
      breakdown = [], 
      scholarship = { name: '', amount: 0 }, 
      remarks = '',
      transactionId = ''
    } = req.body;

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({ error: 'Please enter a valid payment amount' });
    }

    const student = await Student.findOne({ studentId });
    if (!student) {
      return res.status(404).json({ error: `Student with ID ${studentId} not found` });
    }

    // Generate unique institutional receipt number
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const receiptNumber = `REC-${year}-${randomSuffix}`;

    const programCourse = student.currentClass ? 
      `${student.currentClass.course || ''} - ${student.currentClass.branch || ''}`.trim() : 
      student.college || 'Higher Education';

    const payment = await FeePayment.create({
      institutionId: student.institutionId || req.user?.institutionId,
      studentId: student.studentId,
      studentName: student.name,
      programCourse: programCourse,
      amount: numAmount,
      feeCategory,
      breakdown: breakdown.length > 0 ? breakdown : [{ head: feeCategory, amount: numAmount }],
      scholarship,
      paymentMethod,
      transactionId: transactionId || (paymentMethod.includes('Online') ? `TXN_${Date.now()}` : ''),
      receiptNumber,
      status: 'COMPLETED',
      collectedBy: req.user?.username || 'Cashier',
      remarks
    });

    // Reconcile Student Balance
    if (!student.feeDetails) {
      student.feeDetails = { totalAmount: numAmount, paidAmount: 0 };
    }
    student.feeDetails.paidAmount = (Number(student.feeDetails.paidAmount) || 0) + numAmount;
    student.feeDetails.lastPaymentDate = payment.paymentDate;
    student.feeDetails.lastPaymentAmount = numAmount;
    await student.save();

    // Log Activity
    const username = req.user ? req.user.username : 'Cashier';
    await logActivity('Created', 'Finance', `Recorded fee payment ₹${numAmount} for ${student.name} (Receipt: ${receiptNumber})`, username);

    // Notify Student
    try {
      await Notification.create({
        title: 'Fee Payment Received',
        message: `₹${numAmount} payment received via ${paymentMethod}. Receipt #${receiptNumber} is now available in your portal.`,
        targetType: 'student',
        targetId: student.studentId,
        actionTab: 'fee'
      });
    } catch (notifErr) {
      console.error('Failed to notify student:', notifErr);
    }

    res.status(201).json({
      success: true,
      message: 'Fee payment recorded successfully',
      payment,
      studentFeeDetails: student.feeDetails
    });
  } catch (err) {
    console.error('addPayment error:', err);
    res.status(400).json({ error: err.message });
  }
};

// @desc    Get all payments / student payments
// @route   GET /api/v1/fees
// @access  Private
exports.getPayments = async (req, res) => {
  try {
    const { studentId, paymentMethod, status } = req.query;
    const filter = { ...(req.tenantFilter || {}) };

    const userRole = req.user?.role?.name || (typeof req.user?.role === 'string' ? req.user.role : '');
    if (userRole === 'Student') {
      const callerStudentId = req.user.studentId || req.user.username;
      if (!callerStudentId) {
        return res.status(403).json({ error: 'Student record unmapped' });
      }
      filter.studentId = callerStudentId;
    } else if (studentId) {
      filter.studentId = studentId;
    }

    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (status) filter.status = status;

    const payments = await FeePayment.find(filter).sort({ paymentDate: -1 });

    // Compute live summary stats
    const totalCollected = payments.reduce((acc, p) => p.status === 'COMPLETED' ? acc + p.amount : acc, 0);
    const cashTotal = payments.reduce((acc, p) => p.status === 'COMPLETED' && p.paymentMethod === 'Cash' ? acc + p.amount : acc, 0);
    const onlineTotal = payments.reduce((acc, p) => p.status === 'COMPLETED' && p.paymentMethod !== 'Cash' ? acc + p.amount : acc, 0);

    res.json({
      success: true,
      count: payments.length,
      stats: {
        totalCollected,
        cashTotal,
        onlineTotal
      },
      data: payments
    });
  } catch (err) {
    console.error('getPayments error:', err);
    res.status(500).json({ error: err.message });
  }
};

// @desc    Get a single printable formal receipt by receipt number
// @route   GET /api/v1/fees/receipt/:receiptNumber
// @access  Private
exports.getReceipt = async (req, res) => {
  try {
    const payment = await FeePayment.findOne({ receiptNumber: req.params.receiptNumber });
    if (!payment) {
      return res.status(404).json({ error: 'Receipt not found' });
    }

    const userRole = req.user?.role?.name || (typeof req.user?.role === 'string' ? req.user.role : '');
    if (userRole === 'Student') {
      const callerStudentId = req.user.studentId || req.user.username;
      if (payment.studentId !== callerStudentId) {
        return res.status(403).json({ error: 'Unauthorized: Cannot view another student\'s fee receipt' });
      }
    }

    const student = await Student.findOne({ studentId: payment.studentId });

    res.json({
      success: true,
      receipt: payment,
      student: student ? {
        name: student.name,
        studentId: student.studentId,
        email: student.email,
        phone: student.phone,
        enrollmentNo: student.enrollmentNo,
        classRollNo: student.classRollNo,
        college: student.college,
        currentClass: student.currentClass,
        totalFee: student.feeDetails?.totalAmount || 0,
        paidFee: student.feeDetails?.paidAmount || 0,
        balanceDues: (student.feeDetails?.totalAmount || 0) - (student.feeDetails?.paidAmount || 0)
      } : null
    });
  } catch (err) {
    console.error('getReceipt error:', err);
    res.status(500).json({ error: err.message });
  }
};

// @desc    Student online fee payment simulation (UPI / Card / NetBanking)
// @route   POST /api/v1/fees/simulate-online
// @access  Private/Student
exports.simulateOnlinePayment = async (req, res) => {
  try {
    const { studentId, amount, paymentMethod = 'Online (UPI/QR)', feeCategory = 'Tuition Fee' } = req.body;
    const numAmount = Number(amount);

    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({ error: 'Please enter a valid payment amount' });
    }

    const userRole = req.user?.role?.name || (typeof req.user?.role === 'string' ? req.user.role : '');
    let targetStudentId = studentId;
    if (userRole === 'Student') {
      targetStudentId = req.user.studentId || req.user.username;
    }

    if (!targetStudentId) {
      return res.status(400).json({ error: 'Student ID is required' });
    }

    const student = await Student.findOne({ studentId: targetStudentId });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const receiptNumber = `REC-${year}-${randomSuffix}`;
    const transactionId = `UPI_GATEWAY_${Date.now()}`;

    const payment = await FeePayment.create({
      institutionId: student.institutionId,
      studentId: student.studentId,
      studentName: student.name,
      amount: numAmount,
      feeCategory,
      breakdown: [{ head: feeCategory, amount: numAmount }],
      paymentMethod,
      transactionId,
      receiptNumber,
      status: 'COMPLETED',
      collectedBy: 'Self-Serve Payment Gateway',
      remarks: 'Online student portal checkout transaction'
    });

    student.feeDetails.paidAmount = (Number(student.feeDetails.paidAmount) || 0) + numAmount;
    student.feeDetails.lastPaymentDate = payment.paymentDate;
    student.feeDetails.lastPaymentAmount = numAmount;
    await student.save();

    res.status(201).json({
      success: true,
      message: 'Online payment processed successfully via payment gateway',
      receiptNumber,
      transactionId,
      payment,
      updatedFeeDetails: student.feeDetails
    });
  } catch (err) {
    console.error('simulateOnlinePayment error:', err);
    res.status(500).json({ error: err.message });
  }
};

// @desc    Get aggregate institutional financial statistics
// @route   GET /api/v1/fees/stats
// @access  Private/Admin
exports.getFinanceStats = async (req, res) => {
  try {
    const students = await Student.find({}, 'feeDetails name studentId');
    
    let totalExpected = 0;
    let totalCollected = 0;
    let fullyPaidCount = 0;
    let pendingCount = 0;

    students.forEach(s => {
      const tot = Number(s.feeDetails?.totalAmount) || 0;
      const pd = Number(s.feeDetails?.paidAmount) || 0;
      totalExpected += tot;
      totalCollected += pd;
      if (pd >= tot && tot > 0) {
        fullyPaidCount++;
      } else {
        pendingCount++;
      }
    });

    const totalOutstanding = Math.max(0, totalExpected - totalCollected);

    res.json({
      success: true,
      totalExpected,
      totalCollected,
      totalOutstanding,
      fullyPaidCount,
      pendingCount,
      collectionRate: totalExpected > 0 ? ((totalCollected / totalExpected) * 100).toFixed(1) : '100.0'
    });
  } catch (err) {
    console.error('getFinanceStats error:', err);
    res.status(500).json({ error: err.message });
  }
};

// @desc    Create Razorpay Order for Student Online Fee Payment
// @route   POST /api/v1/fees/razorpay/order
// @access  Private / Student
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { studentId, amount, feeCategory = 'Tuition Fee' } = req.body;
    const numAmount = Number(amount);

    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({ error: 'Please enter a valid positive payment amount' });
    }

    const userRole = req.user?.role?.name || (typeof req.user?.role === 'string' ? req.user.role : '');
    let targetStudentId = studentId;
    if (userRole === 'Student') {
      targetStudentId = req.user.studentId || req.user.username;
    }

    if (!targetStudentId) {
      return res.status(400).json({ error: 'Student ID is required' });
    }

    const student = await Student.findOne({ studentId: targetStudentId });
    if (!student) {
      return res.status(404).json({ error: `Student with ID ${targetStudentId} not found` });
    }

    const razorpay = getRazorpayInstance();

    // Razorpay receipt max 40 chars
    const receiptShort = `rec_${Date.now().toString().slice(-8)}_${Math.floor(1000 + Math.random() * 9000)}`;

    const options = {
      amount: Math.round(numAmount * 100), // Razorpay expects amount in paise (1 INR = 100 paise)
      currency: 'INR',
      receipt: receiptShort,
      notes: {
        studentId: student.studentId,
        studentName: student.name,
        feeCategory,
        institutionId: String(student.institutionId || '')
      }
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order,
      keyId: process.env.RAZORPAY_KEY_ID,
      student: {
        name: student.name,
        email: student.email || `${student.studentId.toLowerCase()}@campus.edu`,
        phone: student.phone || '9999999999',
        studentId: student.studentId
      }
    });
  } catch (err) {
    console.error('createRazorpayOrder error:', err);
    res.status(500).json({ error: err.message || 'Failed to initialize Razorpay checkout order' });
  }
};

// @desc    Verify Razorpay payment signature & record fee payment
// @route   POST /api/v1/fees/razorpay/verify
// @access  Private / Student
exports.verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      studentId,
      amount,
      feeCategory = 'Tuition Fee',
      breakdown = [],
      remarks = ''
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Incomplete Razorpay payment verification parameters' });
    }

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({ error: 'Invalid payment amount' });
    }

    const userRole = req.user?.role?.name || (typeof req.user?.role === 'string' ? req.user.role : '');
    let targetStudentId = studentId;
    if (userRole === 'Student') {
      targetStudentId = req.user.studentId || req.user.username;
    }

    if (!targetStudentId) {
      return res.status(400).json({ error: 'Student ID is required' });
    }

    // 1. Cryptographic HMAC-SHA256 signature verification
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_secret) {
      return res.status(500).json({ error: 'Server payment configuration missing secret key' });
    }

    const generatedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Razorpay payment signature mismatch. Transaction flagged as untrusted.' });
    }

    // 2. Prevent duplicate transaction recording
    const existingPayment = await FeePayment.findOne({ transactionId: razorpay_payment_id });
    if (existingPayment) {
      return res.json({
        success: true,
        message: 'Payment was already verified and recorded',
        payment: existingPayment,
        receiptNumber: existingPayment.receiptNumber
      });
    }

    // 3. Find student
    const student = await Student.findOne({ studentId: targetStudentId });
    if (!student) {
      return res.status(404).json({ error: `Student with ID ${targetStudentId} not found` });
    }

    // 4. Generate unique institutional receipt number
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const receiptNumber = `REC-${year}-${randomSuffix}`;

    const programCourse = student.currentClass ? 
      `${student.currentClass.course || ''} - ${student.currentClass.branch || ''}`.trim() : 
      student.college || 'Higher Education';

    // 5. Create FeePayment record
    const payment = await FeePayment.create({
      institutionId: student.institutionId,
      studentId: student.studentId,
      studentName: student.name,
      programCourse,
      amount: numAmount,
      feeCategory,
      breakdown: breakdown.length > 0 ? breakdown : [{ head: feeCategory, amount: numAmount }],
      paymentMethod: 'Online (Razorpay)',
      transactionId: razorpay_payment_id,
      receiptNumber,
      status: 'COMPLETED',
      collectedBy: 'Razorpay Payment Gateway',
      remarks: remarks || `Online Razorpay checkout. Order: ${razorpay_order_id}`
    });

    // 6. Reconcile student balance
    if (!student.feeDetails) {
      student.feeDetails = { totalAmount: numAmount, paidAmount: 0 };
    }
    student.feeDetails.paidAmount = (Number(student.feeDetails.paidAmount) || 0) + numAmount;
    student.feeDetails.lastPaymentDate = payment.paymentDate;
    student.feeDetails.lastPaymentAmount = numAmount;
    await student.save();

    // 7. Audit log & Activity
    await logActivity(
      'Created', 
      'Finance', 
      `Razorpay payment ₹${numAmount} verified for ${student.name} (Txn: ${razorpay_payment_id}, Receipt: ${receiptNumber})`, 
      'Razorpay Gateway'
    );

    // 8. In-app student notification
    try {
      await Notification.create({
        title: 'Fee Payment Confirmed',
        message: `₹${numAmount.toLocaleString('en-IN')} payment received via Razorpay. Official receipt #${receiptNumber} is now available in your Fee Report.`,
        targetType: 'student',
        targetId: student.studentId,
        actionTab: 'fee'
      });
    } catch (notifErr) {
      console.error('Failed to notify student:', notifErr);
    }

    res.status(201).json({
      success: true,
      message: 'Payment verified and official receipt generated successfully',
      receiptNumber,
      transactionId: razorpay_payment_id,
      payment,
      studentFeeDetails: student.feeDetails
    });
  } catch (err) {
    console.error('verifyRazorpayPayment error:', err);
    res.status(500).json({ error: err.message || 'Payment verification failed' });
  }
};

