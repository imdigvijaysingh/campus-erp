const Role = require('../models/Role');
const logActivity = require('../utils/logger');

// @desc    Get all roles
// @route   GET /api/v1/roles
// @access  Private (SuperAdmin)
exports.getRoles = async (req, res, next) => {
  try {
    const roles = await Role.find();
    res.status(200).json({ success: true, count: roles.length, data: roles });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single role
// @route   GET /api/v1/roles/:id
// @access  Private (SuperAdmin)
exports.getRole = async (req, res, next) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ success: false, error: 'Role not found' });
    }
    res.status(200).json({ success: true, data: role });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create new role
// @route   POST /api/v1/roles
// @access  Private (SuperAdmin)
exports.createRole = async (req, res, next) => {
  try {
    const role = await Role.create(req.body);
    await logActivity('Created', 'Role', `Role ${role.name} created`, req.user ? req.user.username : 'System');
    res.status(201).json({ success: true, data: role });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update role
// @route   PUT /api/v1/roles/:id
// @access  Private (SuperAdmin)
exports.updateRole = async (req, res, next) => {
  try {
    const role = await Role.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!role) {
      return res.status(404).json({ success: false, error: 'Role not found' });
    }
    await logActivity('Updated', 'Role', `Role ${role.name} updated`, req.user ? req.user.username : 'System');
    res.status(200).json({ success: true, data: role });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Delete role
// @route   DELETE /api/v1/roles/:id
// @access  Private (SuperAdmin)
exports.deleteRole = async (req, res, next) => {
  try {
    const role = await Role.findByIdAndDelete(req.params.id);
    if (!role) {
      return res.status(404).json({ success: false, error: 'Role not found' });
    }
    await logActivity('Deleted', 'Role', `Role ${role.name} deleted`, req.user ? req.user.username : 'System');
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
