const express = require('express');
const { getOverviewStats, getUserStats } = require('../controllers/statsController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Protected routes
router.get('/overview', protect, getOverviewStats);
router.get('/user', protect, getUserStats);

module.exports = router;