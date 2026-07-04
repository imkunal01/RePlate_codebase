const express = require('express');
const { 
  createFoodPost, 
  getNearbyFoodPosts, 
  claimFoodPost, 
  getUserFoodPosts,
  updateFoodStatus,
  deleteFoodPost,
  getFoodPostById
} = require('../controllers/foodController');
const { protect } = require('../middleware/authMiddleware');
const { checkActiveRole } = require('../middleware/roleMiddleware');

const router = express.Router();

// Protected routes
router.post('/create', protect, checkActiveRole('donor'), createFoodPost);
router.get('/nearby', protect, checkActiveRole('recipient'), getNearbyFoodPosts);
router.get('/mine', protect, getUserFoodPosts);
router.post('/claim/:id', protect, checkActiveRole('recipient'), claimFoodPost);
router.patch('/:id/status', protect, updateFoodStatus);
router.get('/:id', protect, getFoodPostById);
router.delete('/:id', protect, checkActiveRole('donor'), deleteFoodPost);

module.exports = router;