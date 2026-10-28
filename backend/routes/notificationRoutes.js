const express = require('express');
const router = express.Router();
const { createNotification, getMyNotifications, getAllNotifications, deleteNotification } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');
const { protectStudent } = require('../middleware/studentAuthMiddleware');

router.post('/', protect, createNotification); // Admin
router.get('/', protect, getAllNotifications); // Admin
router.delete('/:id', protect, deleteNotification); // Admin
router.get('/my', protectStudent, getMyNotifications); // Student

module.exports = router;
