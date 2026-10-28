const PrivacyRequest = require('../models/PrivacyRequest');
const logAuditEvent = require('../utils/auditLogger');

// @desc    Get all privacy data requests
// @route   GET /api/v1/privacy/requests
// @access  Private
exports.getPrivacyRequests = async (req, res) => {
  try {
    const isSuperAdmin = req.user?.role?.name === 'SuperAdmin';
    const query = isSuperAdmin ? {} : { institutionId: req.user.institutionId };

    const requests = await PrivacyRequest.find(query).sort('-createdAt');
    res.status(200).json({ success: true, count: requests.length, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Create new privacy request (SAR / Right to be Forgotten)
// @route   POST /api/v1/privacy/requests
// @access  Private
exports.createPrivacyRequest = async (req, res) => {
  try {
    const institutionId = req.user.institutionId || req.body.institutionId;
    if (!institutionId) {
      return res.status(400).json({ success: false, error: 'Institution ID required' });
    }

    const request = await PrivacyRequest.create({
      institutionId,
      ...req.body
    });

    await logAuditEvent(req, {
      action: 'CREATE',
      resource: 'PrivacyRequest',
      resourceId: request._id,
      details: `New DPDP Privacy Request (${request.type}) registered for ${request.requester.name}`,
      riskLevel: request.type === 'DELETION' ? 'HIGH' : 'MEDIUM'
    });

    res.status(201).json({ success: true, data: request });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update privacy request status
// @route   PUT /api/v1/privacy/requests/:id
// @access  Private
exports.updatePrivacyRequest = async (req, res) => {
  try {
    const request = await PrivacyRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, error: 'Privacy request not found' });
    }

    const { status, resolutionNotes } = req.body;
    if (status) request.status = status;
    if (resolutionNotes) request.resolutionNotes = resolutionNotes;
    await request.save();

    await logAuditEvent(req, {
      action: 'UPDATE',
      resource: 'PrivacyRequest',
      resourceId: request._id,
      details: `DPDP Request ${request._id} marked as ${status}`,
      riskLevel: 'MEDIUM'
    });

    res.status(200).json({ success: true, data: request });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
