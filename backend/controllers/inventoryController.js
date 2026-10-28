const InventoryItem = require('../models/InventoryItem');
const InventoryIssuance = require('../models/InventoryIssuance');

// @desc    Get all inventory items
// @route   GET /api/v1/inventory/items
// @access  Private/Admin
exports.getItems = async (req, res, next) => {
  try {
    const items = await InventoryItem.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new inventory item
// @route   POST /api/v1/inventory/items
// @access  Private/Admin
exports.createItem = async (req, res, next) => {
  try {
    const item = await InventoryItem.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an inventory item
// @route   PUT /api/v1/inventory/items/:id
// @access  Private/Admin
exports.updateItem = async (req, res, next) => {
  try {
    const item = await InventoryItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!item) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an inventory item
// @route   DELETE /api/v1/inventory/items/:id
// @access  Private/Admin
exports.deleteItem = async (req, res, next) => {
  try {
    const item = await InventoryItem.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }
    // Delete associated issuance records to maintain clean DB
    await InventoryIssuance.deleteMany({ item: req.params.id });

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// --- ISSUANCE MANAGEMENT ---

// @desc    Get all issuance records
// @route   GET /api/v1/inventory/issuance
// @access  Private/Admin
exports.getIssuances = async (req, res, next) => {
  try {
    const issuances = await InventoryIssuance.find().populate('item', 'itemName category unit').sort({ issueDate: -1 });
    res.status(200).json({ success: true, count: issuances.length, data: issuances });
  } catch (error) {
    next(error);
  }
};

// @desc    Issue an item
// @route   POST /api/v1/inventory/issuance
// @access  Private/Admin
exports.issueItem = async (req, res, next) => {
  try {
    const { item, quantityIssued } = req.body;
    
    // Check stock
    const inventoryItem = await InventoryItem.findById(item);
    if (!inventoryItem) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }
    if (inventoryItem.quantity < quantityIssued) {
      return res.status(400).json({ success: false, error: 'Insufficient stock' });
    }

    // Deduct stock
    inventoryItem.quantity -= quantityIssued;
    await inventoryItem.save();

    // Create record
    const issuance = await InventoryIssuance.create(req.body);
    res.status(201).json({ success: true, data: issuance });
  } catch (error) {
    next(error);
  }
};

// @desc    Update issuance status (e.g. Return item)
// @route   PUT /api/v1/inventory/issuance/:id
// @access  Private/Admin
exports.updateIssuanceStatus = async (req, res, next) => {
  try {
    const issuance = await InventoryIssuance.findById(req.params.id);
    if (!issuance) {
      return res.status(404).json({ success: false, error: 'Issuance record not found' });
    }

    const { status } = req.body;
    
    // If it is being returned, add the stock back
    if (status === 'Returned' && issuance.status !== 'Returned') {
      const inventoryItem = await InventoryItem.findById(issuance.item);
      if (inventoryItem) {
        inventoryItem.quantity += issuance.quantityIssued;
        await inventoryItem.save();
      }
    } else if (issuance.status === 'Returned' && status !== 'Returned') {
      // If it was returned but is now being marked as something else, deduct stock
      const inventoryItem = await InventoryItem.findById(issuance.item);
      if (inventoryItem) {
        inventoryItem.quantity -= issuance.quantityIssued;
        await inventoryItem.save();
      }
    }

    issuance.status = status;
    await issuance.save();

    res.status(200).json({ success: true, data: issuance });
  } catch (error) {
    next(error);
  }
};
