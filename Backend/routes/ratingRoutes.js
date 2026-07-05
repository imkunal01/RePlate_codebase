const express = require('express');
const { submitRating, getUserRatings } = require('../controllers/ratingController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, submitRating);
router.get('/user/:userId', getUserRatings);

module.exports = router;
