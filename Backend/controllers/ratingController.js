const Rating = require('../models/ratingModel');
const FoodPost = require('../models/foodModel');

/**
 * @desc    Submit a rating for a completed food post
 * @route   POST /api/ratings
 * @access  Private
 */
const submitRating = async (req, res) => {
  try {
    const { foodPostId, rating, comment } = req.body;

    if (!foodPostId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'FoodPost ID and rating are required'
      });
    }

    // Check if food post exists and is completed
    const foodPost = await FoodPost.findById(foodPostId);
    if (!foodPost) {
      return res.status(404).json({
        success: false,
        message: 'Food post not found'
      });
    }

    if (foodPost.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only rate completed food donations'
      });
    }

    // Determine the toUser based on who is rating
    let toUser = null;
    const isDonor = req.user._id.toString() === foodPost.donorId.toString();
    const isClaimant = req.user._id.toString() === (foodPost.claimedBy && foodPost.claimedBy.toString());

    if (isDonor) {
      toUser = foodPost.claimedBy;
    } else if (isClaimant) {
      toUser = foodPost.donorId;
    } else {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this donation'
      });
    }

    if (!toUser) {
      return res.status(400).json({
        success: false,
        message: 'Target user not found for this donation'
      });
    }

    // Check if already rated
    const existingRating = await Rating.findOne({
      foodPostId,
      fromUser: req.user._id
    });

    if (existingRating) {
      return res.status(400).json({
        success: false,
        message: 'You have already rated this transaction'
      });
    }

    // Create rating
    const newRating = await Rating.create({
      foodPostId,
      fromUser: req.user._id,
      toUser,
      rating,
      comment
    });

    res.status(201).json({
      success: true,
      data: newRating,
      message: 'Rating submitted successfully'
    });
  } catch (error) {
    console.error(`Error in submitRating: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get average rating and reviews for a user
 * @route   GET /api/ratings/user/:userId
 * @access  Public
 */
const getUserRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ toUser: req.params.userId })
      .populate('fromUser', 'name orgName profilePhoto')
      .sort({ createdAt: -1 });

    const count = ratings.length;
    const averageRating = count > 0 
      ? ratings.reduce((acc, item) => acc + item.rating, 0) / count 
      : 0;

    res.status(200).json({
      success: true,
      count,
      averageRating: averageRating.toFixed(1),
      data: ratings
    });
  } catch (error) {
    console.error(`Error in getUserRatings: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  submitRating,
  getUserRatings
};
