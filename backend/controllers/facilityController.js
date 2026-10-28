const HostelRoom = require('../models/HostelRoom');
const HostelAllocation = require('../models/HostelAllocation');
const TransportRoute = require('../models/TransportRoute');
const TransportAllocation = require('../models/TransportAllocation');

// --- HOSTEL ROOMS ---

exports.getRooms = async (req, res, next) => {
  try {
    const rooms = await HostelRoom.find().sort({ block: 1, roomNumber: 1 });
    res.status(200).json({ success: true, count: rooms.length, data: rooms });
  } catch (error) {
    next(error);
  }
};

exports.createRoom = async (req, res, next) => {
  try {
    const room = await HostelRoom.create(req.body);
    res.status(201).json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
};

exports.updateRoom = async (req, res, next) => {
  try {
    const room = await HostelRoom.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!room) return res.status(404).json({ success: false, error: 'Room not found' });
    res.status(200).json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
};

exports.deleteRoom = async (req, res, next) => {
  try {
    const room = await HostelRoom.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ success: false, error: 'Room not found' });
    await HostelAllocation.deleteMany({ room: req.params.id });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// --- HOSTEL ALLOCATIONS ---

exports.getHostelAllocations = async (req, res, next) => {
  try {
    const allocations = await HostelAllocation.find()
      .populate('student', 'firstName lastName enrollmentNo course')
      .populate('room', 'roomNumber block feePerSemester')
      .sort({ allocationDate: -1 });
    res.status(200).json({ success: true, count: allocations.length, data: allocations });
  } catch (error) {
    next(error);
  }
};

exports.allocateHostel = async (req, res, next) => {
  try {
    const { student, room } = req.body;
    
    // Check if room has capacity
    const hostelRoom = await HostelRoom.findById(room);
    if (!hostelRoom) return res.status(404).json({ success: false, error: 'Room not found' });
    if (hostelRoom.occupancy >= hostelRoom.capacity) {
      return res.status(400).json({ success: false, error: 'Room is at full capacity' });
    }

    // Check if student already has active allocation
    const existing = await HostelAllocation.findOne({ student, status: 'Active' });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Student already has an active hostel allocation' });
    }

    // Create allocation
    const allocation = await HostelAllocation.create(req.body);
    
    // Update room occupancy
    hostelRoom.occupancy += 1;
    await hostelRoom.save();

    res.status(201).json({ success: true, data: allocation });
  } catch (error) {
    next(error);
  }
};

exports.vacateHostel = async (req, res, next) => {
  try {
    const allocation = await HostelAllocation.findById(req.params.id);
    if (!allocation) return res.status(404).json({ success: false, error: 'Allocation not found' });
    
    if (allocation.status !== 'Vacated') {
      allocation.status = 'Vacated';
      await allocation.save();

      const hostelRoom = await HostelRoom.findById(allocation.room);
      if (hostelRoom && hostelRoom.occupancy > 0) {
        hostelRoom.occupancy -= 1;
        await hostelRoom.save();
      }
    }

    res.status(200).json({ success: true, data: allocation });
  } catch (error) {
    next(error);
  }
};

// --- TRANSPORT ROUTES ---

exports.getRoutes = async (req, res, next) => {
  try {
    const routes = await TransportRoute.find().sort({ routeName: 1 });
    res.status(200).json({ success: true, count: routes.length, data: routes });
  } catch (error) {
    next(error);
  }
};

exports.createRoute = async (req, res, next) => {
  try {
    const route = await TransportRoute.create(req.body);
    res.status(201).json({ success: true, data: route });
  } catch (error) {
    next(error);
  }
};

exports.updateRoute = async (req, res, next) => {
  try {
    const route = await TransportRoute.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!route) return res.status(404).json({ success: false, error: 'Route not found' });
    res.status(200).json({ success: true, data: route });
  } catch (error) {
    next(error);
  }
};

exports.deleteRoute = async (req, res, next) => {
  try {
    const route = await TransportRoute.findByIdAndDelete(req.params.id);
    if (!route) return res.status(404).json({ success: false, error: 'Route not found' });
    await TransportAllocation.deleteMany({ route: req.params.id });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// --- TRANSPORT ALLOCATIONS ---

exports.getTransportAllocations = async (req, res, next) => {
  try {
    const allocations = await TransportAllocation.find()
      .populate('student', 'firstName lastName enrollmentNo course')
      .populate('route', 'routeName feePerSemester')
      .sort({ allocationDate: -1 });
    res.status(200).json({ success: true, count: allocations.length, data: allocations });
  } catch (error) {
    next(error);
  }
};

exports.allocateTransport = async (req, res, next) => {
  try {
    const { student } = req.body;
    
    // Check if student already has active allocation
    const existing = await TransportAllocation.findOne({ student, status: 'Active' });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Student already has an active transport allocation' });
    }

    const allocation = await TransportAllocation.create(req.body);
    res.status(201).json({ success: true, data: allocation });
  } catch (error) {
    next(error);
  }
};

exports.cancelTransport = async (req, res, next) => {
  try {
    const allocation = await TransportAllocation.findById(req.params.id);
    if (!allocation) return res.status(404).json({ success: false, error: 'Allocation not found' });
    
    allocation.status = 'Cancelled';
    await allocation.save();

    res.status(200).json({ success: true, data: allocation });
  } catch (error) {
    next(error);
  }
};

exports.updateTransportFee = async (req, res, next) => {
  try {
    const { amount } = req.body;
    
    if (amount === undefined || amount < 0) {
      return res.status(400).json({ success: false, error: 'Please provide a valid fee amount' });
    }

    const allocation = await TransportAllocation.findById(req.params.id).populate('route');
    if (!allocation) return res.status(404).json({ success: false, error: 'Allocation not found' });
    
    // Calculate new total
    const newFeeSubmitted = allocation.feeSubmitted + Number(amount);
    
    // Validate cap
    if (newFeeSubmitted > allocation.route.feePerSemester) {
      return res.status(400).json({ 
        success: false, 
        error: `Cannot submit more than total fee. Remaining fee is ${allocation.route.feePerSemester - allocation.feeSubmitted}` 
      });
    }

    allocation.feeSubmitted = newFeeSubmitted;
    await allocation.save();

    res.status(200).json({ success: true, data: allocation });
  } catch (error) {
    next(error);
  }
};
