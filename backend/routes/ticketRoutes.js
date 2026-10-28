const express = require('express');
const { getTickets, getMyTickets, createTicket, updateTicket } = require('../controllers/ticketController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { protectStudent } = require('../middleware/studentAuthMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, authorize('SuperAdmin', 'Admin', 'Staff'), getTickets)
  .post(protectStudent, createTicket);

router.route('/my')
  .get(protectStudent, getMyTickets);

router.route('/:id')
  .put(protect, authorize('SuperAdmin', 'Admin', 'Staff'), updateTicket);

module.exports = router;
