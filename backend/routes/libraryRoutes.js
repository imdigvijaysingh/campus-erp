const express = require('express');
const { getBooks, addBook, updateBook, deleteBook, issueBook, returnBook, getIssuedBooks } = require('../controllers/libraryController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/books')
  .get(protect, authorize('SuperAdmin', 'Admin', 'Librarian'), getBooks)
  .post(protect, authorize('SuperAdmin', 'Admin', 'Librarian'), addBook);

router.route('/books/:id')
  .put(protect, authorize('SuperAdmin', 'Admin', 'Librarian'), updateBook)
  .delete(protect, authorize('SuperAdmin', 'Admin', 'Librarian'), deleteBook);

router.route('/issue')
  .get(protect, authorize('SuperAdmin', 'Admin', 'Librarian'), getIssuedBooks)
  .post(protect, authorize('SuperAdmin', 'Admin', 'Librarian'), issueBook);

router.route('/return')
  .post(protect, authorize('SuperAdmin', 'Admin', 'Librarian'), returnBook);

module.exports = router;
