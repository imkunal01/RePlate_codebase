const multer = require('multer');
const { uploadImage } = require('../services/cloudinaryService');

/**
 * Multer configuration — use memory storage so we can stream to Cloudinary
 * without writing to disk
 */
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB limit
});

/**
 * @desc    Upload a food photo to Cloudinary
 * @route   POST /api/upload/image
 * @access  Private
 */
const uploadFoodImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const result = await uploadImage(req.file.buffer, 'replate/food');

    res.status(200).json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format
      }
    });
  } catch (error) {
    console.error(`Error in uploadFoodImage: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Image upload failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Upload a profile photo to Cloudinary
 * @route   POST /api/upload/profile
 * @access  Private
 */
const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const result = await uploadImage(req.file.buffer, 'replate/profiles');

    // Update user's profilePhoto field
    req.user.profilePhoto = result.secure_url;
    await req.user.save();

    res.status(200).json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id
      }
    });
  } catch (error) {
    console.error(`Error in uploadProfileImage: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Profile photo upload failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = { upload, uploadFoodImage, uploadProfileImage };
