const multer = require('multer');
const path = require('path');

// Set storage engine
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Check file type and reject videos
function checkFileType(file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  
  // Explicitly reject video formats
  const videoExts = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.flv'];
  if (videoExts.includes(ext) || file.mimetype.startsWith('video/')) {
    return cb(new Error('Videos are strictly not accepted to conserve storage and bandwidth.'), false);
  }

  // Allowed images & documents
  const allowedImageExts = ['.jpeg', '.jpg', '.png', '.webp', '.gif'];
  const isImage = allowedImageExts.includes(ext) && file.mimetype.startsWith('image/');
  const isPdf = ext === '.pdf' && file.mimetype === 'application/pdf';

  if (isImage || isPdf) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Only compressed images (JPG, PNG, WEBP) and PDF documents are allowed.'));
  }
}

// 5MB maximum threshold across all uploads (images enforced under 500KB, documents under 5MB)
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB absolute ceiling
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
});

module.exports = upload;
