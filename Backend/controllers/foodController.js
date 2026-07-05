const FoodPost = require('../models/foodModel');
const Claim = require('../models/claimModel');
const User = require('../models/userModel');
const {
  notifyNewDonation,
  notifyDonationClaimed,
  notifyDonationCompleted
} = require('../services/notificationService');

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
      dietaryInfo,
      photo,
      photoPublicId
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
      dietaryInfo,
      photo: photo || '',
      photoPublicId: photoPublicId || ''
    });

    // Notify nearby NGOs (recipients within 10km) asynchronously
    const [foodLon, foodLat] = foodPost.location.coordinates;
    User.find({
      roles: 'recipient',
      isVerified: true,
      fcmToken: { $ne: '' },
      'location.coordinates': {
        $near: {
          $geometry: { type: 'Point', coordinates: [foodLon, foodLat] },
          $maxDistance: 10000
        }
      }
    })
      .limit(50)
      .then((nearbyNGOs) => {
        if (nearbyNGOs.length > 0) {
          notifyNewDonation(nearbyNGOs, foodPost);
        }
      })
      .catch((err) => console.error('Error fetching nearby NGOs for notification:', err.message));

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
      location: {
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
    const foodPost = await FoodPost.findById(foodId).populate('donorId', 'name fcmToken');

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

    // Check if recipient is verified
    if (!req.user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Your account must be verified by an admin before you can claim food.'
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

    // Notify the donor asynchronously
    if (foodPost.donorId && foodPost.donorId.fcmToken) {
      notifyDonationClaimed(foodPost.donorId.fcmToken, foodPost, req.user).catch((err) =>
        console.error('Claim notification error:', err.message)
      );
    }

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
    if (!['available', 'claimed', 'collected', 'completed', 'expired'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const foodPost = await FoodPost.findById(req.params.id)
      .populate('donorId', 'name fcmToken')
      .populate('claimedBy', 'name fcmToken');

    if (!foodPost) {
      return res.status(404).json({
        success: false,
        message: 'Food post not found'
      });
    }

    // Check if user is the donor
    if (foodPost.donorId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this food post'
      });
    }

    // Update status
    foodPost.status = status;
    
    if (status === 'collected') {
      foodPost.collectedAt = new Date();
    }

    // If status is completed, update related claim and send notifications
    if (status === 'completed' && foodPost.claimedBy) {
      foodPost.completedAt = new Date();
      await Claim.findOneAndUpdate(
        { foodId: foodPost._id, recipientId: foodPost.claimedBy._id },
        { status: 'completed', completedAt: new Date() }
      );

      // Notify both parties asynchronously
      const donorToken = foodPost.donorId?.fcmToken;
      const recipientToken = foodPost.claimedBy?.fcmToken;
      notifyDonationCompleted(donorToken, recipientToken, foodPost).catch((err) =>
        console.error('Completion notification error:', err.message)
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

    await FoodPost.findByIdAndDelete(req.params.id);

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

/**
 * @desc    Get a single food post by ID
 * @route   GET /api/food/:id
 * @access  Private
 */
const getFoodPostById = async (req, res) => {
  try {
    const foodPost = await FoodPost.findById(req.params.id)
      .populate('donorId', 'name orgName orgType profilePhoto')
      .populate('claimedBy', 'name orgName');

    if (!foodPost) {
      return res.status(404).json({
        success: false,
        message: 'Food post not found'
      });
    }

    res.status(200).json({
      success: true,
      data: foodPost
    });
  } catch (error) {
    console.error(`Error in getFoodPostById: ${error.message}`);
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
  deleteFoodPost,
  getFoodPostById
};