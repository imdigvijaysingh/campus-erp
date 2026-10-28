const express = require('express');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router
  .route('/')
  .get(protect, authorize('SuperAdmin', 'Admin'), getUsers)
  .post(protect, authorize('SuperAdmin', 'Admin'), createUser);

router
  .route('/:id')
  .get(protect, authorize('SuperAdmin', 'Admin'), getUser)
  .put(protect, authorize('SuperAdmin', 'Admin'), updateUser)
  .delete(protect, authorize('SuperAdmin', 'Admin'), deleteUser);

module.exports = router;
