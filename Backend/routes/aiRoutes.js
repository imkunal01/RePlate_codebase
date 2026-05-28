const express = require('express');
const { getRecommendedFood } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const { checkActiveRole } = require('../middleware/roleMiddleware');

const router = express.Router();

// Protected routes
router.get('/recommend', protect, checkActiveRole('recipient'), getRecommendedFood);

module.exports = router;