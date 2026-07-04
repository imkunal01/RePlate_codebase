const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { upload, uploadFoodImage, uploadProfileImage } = require('../controllers/uploadController');

const router = express.Router();

// Upload food photo — single image, field name 'image'
router.post('/image', protect, upload.single('image'), uploadFoodImage);

// Upload profile photo — single image, field name 'image'
router.post('/profile', protect, upload.single('image'), uploadProfileImage);

module.exports = router;
