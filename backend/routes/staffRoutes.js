const express = require('express');
const router = express.Router();
const {
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  getLeaves,
  applyLeave,
  updateLeaveStatus,
  deleteLeave,
  getAttendanceByDate,
  markAttendance,
  getPayroll,
  generatePayroll,
  updatePayrollStatus
} = require('../controllers/staffController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Protect all staff routes (SuperAdmin and Admin can manage HR)
router.use(protect);
router.use(authorize('SuperAdmin', 'Admin', 'TransportManager'));

// Staff Directory Routes
router.route('/')
  .get(getStaff)
  .post(createStaff);

router.route('/:id')
  .put(updateStaff)
  .delete(deleteStaff);

// Leave Routes
router.route('/leaves')
  .get(getLeaves)
  .post(applyLeave);

router.route('/leaves/:id')
  .put(updateLeaveStatus)
  .delete(deleteLeave);

// Attendance Routes
router.route('/attendance')
  .get(getAttendanceByDate)
  .post(markAttendance);

// Payroll Routes
router.route('/payroll')
  .get(getPayroll);

router.route('/payroll/generate')
  .post(generatePayroll);

router.route('/payroll/:id')
  .put(updatePayrollStatus);

module.exports = router;
