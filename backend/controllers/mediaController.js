const Media = require('../models/Media');
const fs = require('fs');
const path = require('path');
const logActivity = require('../utils/logger');
const ImageKit = require('imagekit');

const imagekit = new ImageKit({
    publicKey : process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey : process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint : process.env.IMAGEKIT_URL_ENDPOINT
});

// @desc    Upload media
// @route   POST /api/v1/media/upload
// @access  Private
exports.uploadMedia = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: 'Please upload at least one file' });
    }

    const mediaDocs = [];

    for (const file of req.files) {
      try {
        const fileData = fs.readFileSync(file.path);
        const response = await new Promise((resolve, reject) => {
          imagekit.upload({
            file: fileData,
            fileName: file.filename,
            folder: '/devbhoomi_uploads'
          }, (err, result) => {
            if (err) reject(err);
            else resolve(result);
          });
        });

        mediaDocs.push({
          filename: response.fileId, // Use ImageKit fileId for deletion
          url: response.url,
          mimetype: file.mimetype,
          size: file.size,
          category: req.body.category || 'general'
        });

        // Delete local file after upload
        if (fs.existsSync(file.path)) {
           fs.unlinkSync(file.path);
        }
      } catch (uploadError) {
        console.error('ImageKit upload error:', uploadError);
        // Clean up local file even if upload fails
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      }
    }

    if (mediaDocs.length === 0) {
       return res.status(500).json({ success: false, error: 'Failed to upload files to ImageKit' });
    }

    const media = await Media.insertMany(mediaDocs);
    await logActivity('Added', 'Media', `Uploaded ${media.length} files`, req.user || 'Admin User');

    res.status(201).json({
      success: true,
      data: media
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all media
// @route   GET /api/v1/media
// @access  Public
exports.getMedia = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.category) {
      query.category = req.query.category;
    }
    const media = await Media.find(query).sort('-uploadedAt');
    res.status(200).json({
      success: true,
      count: media.length,
      data: media
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update media category
// @route   PUT /api/v1/media/:id
// @access  Private
exports.updateMediaCategory = async (req, res, next) => {
  try {
    const media = await Media.findByIdAndUpdate(req.params.id, { category: req.body.category }, {
      new: true,
      runValidators: true
    });

    if (!media) {
      return res.status(404).json({ success: false, error: 'Media not found' });
    }

    res.status(200).json({
      success: true,
      data: media
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete media
// @route   DELETE /api/v1/media/:id
// @access  Private
exports.deleteMedia = async (req, res, next) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) {
      return res.status(404).json({ success: false, error: 'Media not found' });
    }

    // Try to delete from ImageKit
    try {
      await new Promise((resolve, reject) => {
        imagekit.deleteFile(media.filename, (err, result) => {
           if (err) reject(err);
           else resolve(result);
        });
      });
    } catch (e) {
      console.log('ImageKit delete error:', e);
    }

    await media.deleteOne();
    await logActivity('Deleted', 'Media', `Deleted file: ${media.filename}`, req.user || 'Admin User');

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete multiple media
// @route   POST /api/v1/media/delete-bulk
// @access  Private
exports.deleteMediaBulk = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, error: 'Please provide media IDs to delete' });
    }

    const mediaItems = await Media.find({ _id: { $in: ids } });
    
    // Delete physical files
    for (const media of mediaItems) {
      try {
        await new Promise((resolve, reject) => {
          imagekit.deleteFile(media.filename, (err, result) => {
             if (err) reject(err);
             else resolve(result);
          });
        });
      } catch (e) {
        console.log('ImageKit delete error:', e);
      }
    }

    await Media.deleteMany({ _id: { $in: ids } });
    await logActivity('Deleted', 'Media', `Deleted ${mediaItems.length} files in bulk`, req.user || 'Admin User');

    res.status(200).json({ success: true, count: mediaItems.length, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Helper function to delete media by URL
exports.deleteMediaByUrl = async (url) => {
  if (!url) return;
  try {
    const media = await Media.findOne({ url });
    if (media) {
      // Try to delete from ImageKit
      try {
        await new Promise((resolve, reject) => {
          imagekit.deleteFile(media.filename, (err, result) => {
             if (err) reject(err);
             else resolve(result);
          });
        });
      } catch (e) {
        console.log('ImageKit delete error:', e);
      }
      await media.deleteOne();
    }
  } catch (error) {
    console.error('Error deleting media by URL:', error);
  }
};
