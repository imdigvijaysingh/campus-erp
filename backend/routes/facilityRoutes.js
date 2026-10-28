const express = require('express');
const router = express.Router();
const {
  getRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  getHostelAllocations,
  allocateHostel,
  vacateHostel,
  getRoutes,
  createRoute,
  updateRoute,
  deleteRoute,
  getTransportAllocations,
  allocateTransport,
  cancelTransport,
  updateTransportFee
} = require('../controllers/facilityController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('SuperAdmin', 'Admin', 'Teacher', 'FeeCashier', 'HostelWarden', 'TransportManager'));

// Hostel Rooms
router.route('/hostel/rooms')
  .get(getRooms)
  .post(createRoom);

router.route('/hostel/rooms/:id')
  .put(updateRoom)
  .delete(deleteRoom);

// Hostel Allocations
router.route('/hostel/allocations')
  .get(getHostelAllocations)
  .post(allocateHostel);

router.route('/hostel/allocations/:id')
  .put(vacateHostel);

// Transport Routes
router.route('/transport/routes')
  .get(getRoutes)
  .post(createRoute);

router.route('/transport/routes/:id')
  .put(updateRoute)
  .delete(deleteRoute);

// Transport Allocations
router.route('/transport/allocations')
  .get(getTransportAllocations)
  .post(allocateTransport);

router.route('/transport/allocations/:id')
  .put(cancelTransport);

router.route('/transport/allocations/:id/fee')
  .put(updateTransportFee);

module.exports = router;
