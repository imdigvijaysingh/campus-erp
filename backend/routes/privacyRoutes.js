const express = require('express');
const { getPrivacyRequests, createPrivacyRequest, updatePrivacyRequest } = require('../controllers/privacyController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/requests', protect, authorize('SuperAdmin', 'Admin'), getPrivacyRequests);
router.post('/requests', protect, createPrivacyRequest);
router.put('/requests/:id', protect, authorize('SuperAdmin', 'Admin'), updatePrivacyRequest);

module.exports = router;
