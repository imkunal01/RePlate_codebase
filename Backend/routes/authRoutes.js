const express = require('express');
const { signup, login, googleAuth, logout, getMe, getGoogleAuthURL, googleCallback } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/google', googleAuth);
router.get('/google/url', getGoogleAuthURL);
router.get('/google/callback', googleCallback);

// Protected routes
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;