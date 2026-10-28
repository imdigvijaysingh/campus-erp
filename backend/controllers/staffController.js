const Staff = require('../models/Staff');
const Leave = require('../models/Leave');
const StaffAttendance = require('../models/StaffAttendance');
const Payroll = require('../models/Payroll');
const User = require('../models/User');
const Role = require('../models/Role');

// @desc    Get all staff members
// @route   GET /api/v1/staff
// @access  Private/Admin
exports.getStaff = async (req, res, next) => {
  try {
    const staff = await Staff.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: staff.length, data: staff });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new staff member
// @route   POST /api/v1/staff
// @access  Private/Admin
exports.createStaff = async (req, res, next) => {
  try {
    const staff = await Staff.create(req.body);

    // Create login account if requested
    if (req.body.createLogin && req.body.username && req.body.password && req.body.roleName) {
      let role = await Role.findOne({ name: req.body.roleName });
      if (!role) {
        role = await Role.create({
          name: req.body.roleName,
          description: `Auto-created role for ${req.body.roleName}`,
          permissions: { dashboard: { read: true } }
        });
      }
      await User.create({
        username: req.body.username,
        email: staff.email,
        password: req.body.password,
        role: role._id,
        staffProfile: staff._id
      });
    }

    res.status(201).json({ success: true, data: staff });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a staff member
// @route   PUT /api/v1/staff/:id
// @access  Private/Admin
exports.updateStaff = async (req, res, next) => {
  try {
    const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!staff) {
      return res.status(404).json({ success: false, error: 'Staff not found' });
    }

    // Handle login account updates if requested
    if (req.body.createLogin) {
      let role = await Role.findOne({ name: req.body.roleName });
      if (!role) {
        role = await Role.create({
          name: req.body.roleName,
          description: `Auto-created role for ${req.body.roleName}`,
          permissions: { dashboard: { read: true } }
        });
      }

      let user = await User.findOne({ staffProfile: staff._id });
      if (user) {
        user.username = req.body.username || user.username;
        if (req.body.password) {
           user.password = req.body.password;
        }
        user.role = role._id;
        await user.save();
      } else if (req.body.username && req.body.password) {
        await User.create({
          username: req.body.username,
          email: staff.email,
          password: req.body.password,
          role: role._id,
          staffProfile: staff._id
        });
      }
    }

    res.status(200).json({ success: true, data: staff });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a staff member
// @route   DELETE /api/v1/staff/:id
// @access  Private/Admin
exports.deleteStaff = async (req, res, next) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    if (!staff) {
      return res.status(404).json({ success: false, error: 'Staff not found' });
    }
    // Also delete their attendance, leaves, and payroll records to clean up DB
    await Leave.deleteMany({ staff: req.params.id });
    await StaffAttendance.deleteMany({ staff: req.params.id });
    await Payroll.deleteMany({ staff: req.params.id });

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// --- LEAVE MANAGEMENT ---

// @desc    Get all leaves
// @route   GET /api/v1/staff/leaves
// @access  Private/Admin
exports.getLeaves = async (req, res, next) => {
  try {
    const leaves = await Leave.find().populate('staff', 'firstName lastName employeeId department').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: leaves.length, data: leaves });
  } catch (error) {
    next(error);
  }
};

// @desc    Apply for leave (or Admin creates leave for staff)
// @route   POST /api/v1/staff/leaves
// @access  Private/Admin
exports.applyLeave = async (req, res, next) => {
  try {
    const leave = await Leave.create(req.body);
    res.status(201).json({ success: true, data: leave });
  } catch (error) {
    next(error);
  }
};

// @desc    Update leave status
// @route   PUT /api/v1/staff/leaves/:id
// @access  Private/Admin
exports.updateLeaveStatus = async (req, res, next) => {
  try {
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );
    if (!leave) {
      return res.status(404).json({ success: false, error: 'Leave record not found' });
    }
    res.status(200).json({ success: true, data: leave });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete leave
// @route   DELETE /api/v1/staff/leaves/:id
// @access  Private/Admin
exports.deleteLeave = async (req, res, next) => {
  try {
    const leave = await Leave.findByIdAndDelete(req.params.id);
    if (!leave) {
      return res.status(404).json({ success: false, error: 'Leave record not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// --- ATTENDANCE MANAGEMENT ---

// @desc    Get attendance for a specific date
// @route   GET /api/v1/staff/attendance?date=YYYY-MM-DD
// @access  Private/Admin
exports.getAttendanceByDate = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ success: false, error: 'Please provide a date' });
    }
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const attendance = await StaffAttendance.find({
      date: { $gte: startOfDay, $lte: endOfDay }
    }).populate('staff', 'firstName lastName employeeId department');

    res.status(200).json({ success: true, data: attendance });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark attendance for multiple staff members
// @route   POST /api/v1/staff/attendance
// @access  Private/Admin
exports.markAttendance = async (req, res, next) => {
  try {
    const { date, records } = req.body;
    // records is an array of { staff: id, status: 'Present/Absent/Half-Day/Leave' }
    
    if (!date || !records || !Array.isArray(records)) {
      return res.status(400).json({ success: false, error: 'Invalid data format' });
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const savedRecords = [];

    for (const record of records) {
      const existing = await StaffAttendance.findOne({ staff: record.staff, date: startOfDay });
      if (existing) {
        existing.status = record.status;
        await existing.save();
        savedRecords.push(existing);
      } else {
        const newRecord = await StaffAttendance.create({
          staff: record.staff,
          date: startOfDay,
          status: record.status
        });
        savedRecords.push(newRecord);
      }
    }

    res.status(200).json({ success: true, data: savedRecords });
  } catch (error) {
    next(error);
  }
};

// --- PAYROLL MANAGEMENT ---

// @desc    Get payroll for a specific month and year
// @route   GET /api/v1/staff/payroll?month=M&year=YYYY
// @access  Private/Admin
exports.getPayroll = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) {
      return res.status(400).json({ success: false, error: 'Please provide month and year' });
    }

    const payrolls = await Payroll.find({ month, year }).populate('staff', 'firstName lastName employeeId department salary');
    res.status(200).json({ success: true, data: payrolls });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate payroll for a month/year
// @route   POST /api/v1/staff/payroll/generate
// @access  Private/Admin
exports.generatePayroll = async (req, res, next) => {
  try {
    const { month, year } = req.body;
    if (!month || !year) {
      return res.status(400).json({ success: false, error: 'Please provide month and year' });
    }

    // Find all active staff
    const allStaff = await Staff.find({ status: 'Active' });
    const generated = [];

    for (const staff of allStaff) {
      const basic = staff.salary?.basic || 0;
      const allowances = staff.salary?.allowances || 0;
      const deductions = staff.salary?.deductions || 0;
      const netSalary = basic + allowances - deductions;

      // Upsert payroll record
      const record = await Payroll.findOneAndUpdate(
        { staff: staff._id, month, year },
        { 
          basic, allowances, deductions, netSalary,
          // don't overwrite status if it exists, let upsert handle defaults manually
        },
        { new: true }
      );

      if (record) {
        generated.push(record);
      } else {
        const newRecord = await Payroll.create({
          staff: staff._id, month, year, basic, allowances, deductions, netSalary, status: 'Pending'
        });
        generated.push(newRecord);
      }
    }

    res.status(200).json({ success: true, data: generated });
  } catch (error) {
    next(error);
  }
};

// @desc    Update payroll status (e.g. mark as Paid)
// @route   PUT /api/v1/staff/payroll/:id
// @access  Private/Admin
exports.updatePayrollStatus = async (req, res, next) => {
  try {
    const payload = { status: req.body.status };
    if (req.body.status === 'Paid') {
      payload.paymentDate = new Date();
    }

    const payroll = await Payroll.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!payroll) {
      return res.status(404).json({ success: false, error: 'Payroll not found' });
    }
    res.status(200).json({ success: true, data: payroll });
  } catch (error) {
    next(error);
  }
};
