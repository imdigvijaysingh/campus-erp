const { Book, IssuedBook } = require('../models/Library');
const Student = require('../models/Student');

exports.getBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.addBook = async (req, res) => {
  try {
    const book = await Book.create(req.body);
    res.status(201).json(book);
  } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.json(book);
  } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.json({ message: 'Book deleted successfully' });
  } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.issueBook = async (req, res) => {
  try {
    const { bookId, studentId, dueDate } = req.body;
    const book = await Book.findById(bookId);
    if (!book || book.availableCopies < 1) return res.status(400).json({ error: 'Book not available' });
    
    const student = await Student.findOne({ studentId });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    book.availableCopies -= 1;
    await book.save();

    const issued = await IssuedBook.create({ book: bookId, studentId, dueDate });
    res.status(201).json(issued);
  } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.returnBook = async (req, res) => {
  try {
    const { issuedBookId, fine, status } = req.body;
    const issued = await IssuedBook.findById(issuedBookId);
    if (!issued || issued.status !== 'Issued') return res.status(400).json({ error: 'Invalid record' });

    const newStatus = status || 'Returned';
    issued.status = newStatus;
    issued.returnDate = Date.now();
    issued.fine = fine || 0;
    await issued.save();

    const book = await Book.findById(issued.book);
    if (newStatus === 'Returned' || newStatus === 'Torn') {
      book.availableCopies += 1;
    } else if (newStatus === 'Lost' || newStatus === 'Missing') {
      book.totalCopies -= 1;
    }
    await book.save();

    res.json(issued);
  } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.getIssuedBooks = async (req, res) => {
  try {
    const records = await IssuedBook.find().populate('book');
    res.json(records);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
