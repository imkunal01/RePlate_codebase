const { getRecommendations } = require('../services/matcher');
const User = require('../models/userModel');

/**
 * @desc    Get AI food recommendations for a recipient
 * @route   GET /api/ai/recommend
 * @access  Private/Recipient
 */
const getRecommendedFood = async (req, res) => {
  try {
    // Get limit from query params or use default
    const { limit = 10 } = req.query;
    
    // Get user with full details
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get recommendations using the matcher service
    const recommendations = await getRecommendations(user, parseInt(limit));
    
    res.status(200).json({
      success: true,
      count: recommendations.length,
      data: recommendations
    });
  } catch (error) {
    console.error(`Error in getRecommendedFood: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getRecommendedFood
};