const Ticket = require('../models/Ticket');

// @desc    Get all tickets (Admin)
// @route   GET /api/v1/tickets
// @access  Private/Admin
const getTickets = async (req, res) => {
  try {
    const filter = { ...(req.tenantFilter || {}) };
    const userRole = req.user?.role?.name || (typeof req.user?.role === 'string' ? req.user.role : '');
    if (userRole === 'Student') {
      const callerStudentId = req.user.studentId || req.user.username;
      filter.studentId = callerStudentId;
    }

    const tickets = await Ticket.find(filter).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get tickets for logged-in student
// @route   GET /api/v1/tickets/my
// @access  Private/Student
const getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ studentId: req.student.studentId }).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Create a ticket
// @route   POST /api/v1/tickets
// @access  Private/Student
const createTicket = async (req, res) => {
  try {
    const ticket = await Ticket.create({
      ...req.body,
      studentId: req.student.studentId // Ensure ticket is linked to student
    });
    res.status(201).json(ticket);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Update a ticket (e.g. status, reply)
// @route   PUT /api/v1/tickets/:id
// @access  Private/Admin
const updateTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    res.json(ticket);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { getTickets, getMyTickets, createTicket, updateTicket };
