const express = require('express');
const {
  getRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole
} = require('../controllers/roleController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Enforce authentication & SuperAdmin/Admin authorization across all role endpoints
router.use(protect);
router.use(authorize('SuperAdmin', 'Admin'));

router
  .route('/')
  .get(getRoles)
  .post(createRole);

router
  .route('/:id')
  .get(getRole)
  .put(updateRole)
  .delete(deleteRole);

module.exports = router;
