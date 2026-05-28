const FoodPost = require('../models/foodModel');
const Claim = require('../models/claimModel');

/**
 * @desc    Create a new food post
 * @route   POST /api/food/create
 * @access  Private/Donor
 */
const createFoodPost = async (req, res) => {
  try {
    const {
      name,
      description,
      type,
      quantity,
      expiryTime,
      location,
      pickupInstructions,
      dietaryInfo
    } = req.body;

    // Create new food post
    const foodPost = await FoodPost.create({
      donorId: req.user._id,
      name,
      description,
      type,
      quantity,
      expiryTime,
      location,
      pickupInstructions,
      dietaryInfo
    });

    res.status(201).json({
      success: true,
      data: foodPost
    });
  } catch (error) {
    console.error(`Error in createFoodPost: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get nearby food posts
 * @route   GET /api/food/nearby
 * @access  Private/Recipient
 */
const getNearbyFoodPosts = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 10, limit = 20 } = req.query;

    // Convert maxDistance from km to meters
    const maxDistanceMeters = parseFloat(maxDistance) * 1000;

    // Find nearby food posts
    const foodPosts = await FoodPost.find({
      status: 'available',
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: maxDistanceMeters
        }
      }
    })
      .limit(parseInt(limit))
      .populate('donorId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: foodPosts.length,
      data: foodPosts
    });
  } catch (error) {
    console.error(`Error in getNearbyFoodPosts: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Claim a food post
 * @route   POST /api/food/claim/:id
 * @access  Private/Recipient
 */
const claimFoodPost = async (req, res) => {
  try {
    const foodId = req.params.id;

    // Find the food post
    const foodPost = await FoodPost.findById(foodId);

    if (!foodPost) {
      return res.status(404).json({
        success: false,
        message: 'Food post not found'
      });
    }

    // Check if food post is already claimed
    if (foodPost.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: `Food post is already ${foodPost.status}`
      });
    }

    // Create a claim
    const claim = await Claim.create({
      foodId,
      recipientId: req.user._id,
      notes: req.body.notes || ''
    });

    // Update food post status
    foodPost.status = 'claimed';
    foodPost.claimedBy = req.user._id;
    await foodPost.save();

    res.status(200).json({
      success: true,
      data: claim,
      message: 'Food claimed successfully'
    });
  } catch (error) {
    console.error(`Error in claimFoodPost: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get user's food posts
 * @route   GET /api/food/mine
 * @access  Private
 */
const getUserFoodPosts = async (req, res) => {
  try {
    let query = {};
    
    // If user is a donor, get their posted food
    if (req.user.activeRole === 'donor') {
      query = { donorId: req.user._id };
    } 
    // If user is a recipient, get their claimed food
    else if (req.user.activeRole === 'recipient') {
      query = { claimedBy: req.user._id };
    }

    const foodPosts = await FoodPost.find(query)
      .sort({ createdAt: -1 })
      .populate('donorId', 'name')
      .populate('claimedBy', 'name');

    res.status(200).json({
      success: true,
      count: foodPosts.length,
      data: foodPosts
    });
  } catch (error) {
    console.error(`Error in getUserFoodPosts: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Update food post status
 * @route   PATCH /api/food/:id/status
 * @access  Private/Donor
 */
const updateFoodStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate status
    if (!['available', 'claimed', 'completed', 'expired'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const foodPost = await FoodPost.findById(req.params.id);

    if (!foodPost) {
      return res.status(404).json({
        success: false,
        message: 'Food post not found'
      });
    }

    // Check if user is the donor
    if (foodPost.donorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this food post'
      });
    }

    // Update status
    foodPost.status = status;
    
    // If status is completed, update related claim
    if (status === 'completed' && foodPost.claimedBy) {
      await Claim.findOneAndUpdate(
        { foodId: foodPost._id, recipientId: foodPost.claimedBy },
        { status: 'completed', completedAt: Date.now() }
      );
    }

    await foodPost.save();

    res.status(200).json({
      success: true,
      data: foodPost
    });
  } catch (error) {
    console.error(`Error in updateFoodStatus: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Delete a food post
 * @route   DELETE /api/food/:id
 * @access  Private/Donor
 */
const deleteFoodPost = async (req, res) => {
  try {
    const foodPost = await FoodPost.findById(req.params.id);

    if (!foodPost) {
      return res.status(404).json({
        success: false,
        message: 'Food post not found'
      });
    }

    // Check if user is the donor
    if (foodPost.donorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this food post'
      });
    }

    // Check if food is already claimed
    if (foodPost.status === 'claimed' || foodPost.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: `Cannot delete a ${foodPost.status} food post`
      });
    }

    await foodPost.remove();

    res.status(200).json({
      success: true,
      message: 'Food post deleted successfully'
    });
  } catch (error) {
    console.error(`Error in deleteFoodPost: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createFoodPost,
  getNearbyFoodPosts,
  claimFoodPost,
  getUserFoodPosts,
  updateFoodStatus,
  deleteFoodPost
};