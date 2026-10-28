const express = require('express');
const router = express.Router();
const {
  getItems,
  createItem,
  updateItem,
  deleteItem,
  getIssuances,
  issueItem,
  updateIssuanceStatus
} = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('SuperAdmin', 'Admin', 'Teacher', 'Librarian', 'StoreIncharge'));

// Inventory Items
router.route('/items')
  .get(getItems)
  .post(createItem);

router.route('/items/:id')
  .put(updateItem)
  .delete(deleteItem);

// Issuance
router.route('/issuance')
  .get(getIssuances)
  .post(issueItem);

router.route('/issuance/:id')
  .put(updateIssuanceStatus);

module.exports = router;
