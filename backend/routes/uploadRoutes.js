const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { uploadMedia, getMedia, deleteMedia, deleteMediaBulk, updateMediaCategory } = require('../controllers/mediaController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Setup multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    // Ensure the uploads directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    
    // Explicitly reject video formats
    const videoExts = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.flv'];
    if (videoExts.includes(ext) || file.mimetype.startsWith('video/')) {
      return cb(new Error('Videos are not accepted to conserve cloud storage and bandwidth.'), false);
    }

    const filetypes = /jpeg|jpg|png|gif|webp|pdf/;
    const extname = filetypes.test(ext.replace('.', ''));
    const isImage = file.mimetype.startsWith('image/');
    const isPdf = file.mimetype === 'application/pdf';

    if (extname && (isImage || isPdf)) {
      return cb(null, true);
    } else {
      cb(new Error('Error: Only images under 500KB and PDF documents under 5MB are allowed.'));
    }
  }
});

router.post('/upload', protect, authorize('SuperAdmin', 'Admin', 'Staff', 'Faculty'), upload.array('media', 20), uploadMedia);
router.post('/delete-bulk', protect, authorize('SuperAdmin', 'Admin'), deleteMediaBulk);
router.get('/', protect, authorize('SuperAdmin', 'Admin', 'Staff', 'Faculty'), getMedia);
router.put('/:id', protect, authorize('SuperAdmin', 'Admin'), updateMediaCategory);
router.delete('/:id', protect, authorize('SuperAdmin', 'Admin'), deleteMedia);

module.exports = router;
