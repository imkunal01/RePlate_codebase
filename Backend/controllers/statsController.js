const User = require('../models/userModel');
const FoodPost = require('../models/foodModel');
const Claim = require('../models/claimModel');
/**
 * @desc    Get overview statistics
 * @route   GET /api/stats/overview
 * @access  Private
 */
const getOverviewStats = async (req, res) => {
  try {
    // Count total users by role
    const donorCount = await User.countDocuments({ roles: 'donor' });
    const recipientCount = await User.countDocuments({ roles: 'recipient' });
    
    // Count active food posts
    const activePosts = await FoodPost.countDocuments({ status: 'available' });
    
    // Count completed donations (meals saved)
    const mealsSaved = await FoodPost.countDocuments({ status: 'completed' });
    
    // Count total food quantity by type
    const foodQuantityByType = await FoodPost.aggregate([
      { $match: { status: 'completed' } },
      { $group: {
          _id: '$type',
          totalQuantity: { $sum: '$quantity.amount' }
        }
      },
      { $project: {
          foodType: '$_id',
          totalQuantity: 1,
          _id: 0
        }
      }
    ]);
    
    // Get recent activity
    const recentActivity = await FoodPost.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('donorId', 'name')
      .populate('claimedBy', 'name')
      .select('name status createdAt updatedAt');
    
    // Calculate success rate
    const totalClaims = await Claim.countDocuments();
    const completedClaims = await Claim.countDocuments({ status: 'completed' });
    const successRate = totalClaims > 0 ? (completedClaims / totalClaims) * 100 : 0;
    
    res.status(200).json({
      success: true,
      data: {
        userStats: {
          donors: donorCount,
          recipients: recipientCount,
          total: donorCount + recipientCount
        },
        foodStats: {
          activePosts,
          mealsSaved,
          foodQuantityByType
        },
        activityStats: {
          recentActivity,
          successRate: Math.round(successRate)
        }
      }
    });
  } catch (error) {
    console.error(`Error in getOverviewStats: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get user-specific statistics
 * @route   GET /api/stats/user
 * @access  Private
 */
const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get user's role
    const user = await User.findById(userId);
    const isRecipient = user.roles.includes('recipient');
    const isDonor = user.roles.includes('donor');
    
    let stats = {
      totalPosts: 0,
      activePosts: 0,
      completedPosts: 0,
      totalClaims: 0,
      completedClaims: 0
    };
    
    // Get donor stats
    if (isDonor) {
      stats.totalPosts = await FoodPost.countDocuments({ donorId: userId });
      stats.activePosts = await FoodPost.countDocuments({ 
        donorId: userId,
        status: 'available'
      });
      stats.completedPosts = await FoodPost.countDocuments({ 
        donorId: userId,
        status: 'completed'
      });
    }
    
    // Get recipient stats
    if (isRecipient) {
      stats.totalClaims = await Claim.countDocuments({ recipientId: userId });
      stats.completedClaims = await Claim.countDocuments({ 
        recipientId: userId,
        status: 'completed'
      });
    }
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error(`Error in getUserStats: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getOverviewStats,
  getUserStats
};