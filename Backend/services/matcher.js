const FoodPost = require('../models/foodModel');

/**
 * AI Matching Service
 * Provides recommendation algorithms for matching food donations with recipients
 */

/**
 * Calculate distance between two points using Haversine formula
 * @param {Array} coords1 - [longitude, latitude] of first point
 * @param {Array} coords2 - [longitude, latitude] of second point
 * @returns {Number} Distance in kilometers
 */
const calculateDistance = (coords1, coords2) => {
  const [lon1, lat1] = coords1;
  const [lon2, lat2] = coords2;
  
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in km
  
  return distance;
};

/**
 * Convert degrees to radians
 * @param {Number} deg - Degrees
 * @returns {Number} Radians
 */
const deg2rad = (deg) => {
  return deg * (Math.PI/180);
};

/**
 * Calculate food type match score based on user preferences
 * @param {Object} foodPost - Food post object
 * @param {Object} userPreferences - User preferences object
 * @returns {Number} Match score (0-1)
 */
const calculateFoodTypeMatch = (foodPost, userPreferences) => {
  // If user has no food type preferences, return neutral score
  if (!userPreferences.foodTypes || userPreferences.foodTypes.length === 0) {
    return 0.5;
  }
  
  // Check if food type is in user preferences
  if (userPreferences.foodTypes.includes(foodPost.type)) {
    return 1;
  }
  
  return 0.3; // Lower score for non-preferred food types
};

/**
 * Calculate dietary match score
 * @param {Object} foodPost - Food post object
 * @param {Object} userPreferences - User preferences object
 * @returns {Number} Match score (0-1)
 */
const calculateDietaryMatch = (foodPost, userPreferences) => {
  // If user has no dietary restrictions, return perfect score
  if (!userPreferences.dietaryRestrictions || userPreferences.dietaryRestrictions.length === 0) {
    return 1;
  }
  
  // Check if food meets all dietary restrictions
  const restrictions = userPreferences.dietaryRestrictions;
  let matchScore = 1;
  
  if (restrictions.includes('vegetarian') && !foodPost.dietaryInfo.vegetarian) {
    matchScore = 0;
  }
  
  if (restrictions.includes('vegan') && !foodPost.dietaryInfo.vegan) {
    matchScore = 0;
  }
  
  if (restrictions.includes('glutenFree') && !foodPost.dietaryInfo.glutenFree) {
    matchScore = 0;
  }
  
  if (restrictions.includes('nutFree') && !foodPost.dietaryInfo.nutFree) {
    matchScore = 0;
  }
  
  if (restrictions.includes('dairyFree') && !foodPost.dietaryInfo.dairyFree) {
    matchScore = 0;
  }
  
  return matchScore;
};

/**
 * Calculate distance match score
 * @param {Number} distance - Distance in kilometers
 * @param {Number} maxDistance - Maximum preferred distance in kilometers
 * @returns {Number} Match score (0-1)
 */
const calculateDistanceMatch = (distance, maxDistance) => {
  if (distance <= maxDistance / 3) {
    return 1; // Excellent match for very close items
  } else if (distance <= maxDistance) {
    // Linear decrease from 1 to 0.5 as distance approaches maxDistance
    return 1 - (0.5 * (distance - maxDistance/3) / (maxDistance - maxDistance/3));
  } else {
    return 0.5 * (maxDistance / distance); // Score decreases as distance exceeds max
  }
};

/**
 * Find recommended food posts for a user
 * @param {Object} user - User object
 * @param {Number} limit - Maximum number of recommendations
 * @returns {Promise<Array>} Array of recommended food posts
 */
const getRecommendations = async (user, limit = 10) => {
  try {
    // Get user location and preferences
    const userLocation = user.location.coordinates;
    const maxDistance = user.preferences.maxDistance || 10; // Default 10km
    
    // Find available food posts
    const availablePosts = await FoodPost.find({ 
      status: 'available',
      expiryTime: { $gt: new Date() } // Not expired
    }).populate('donorId', 'name');
    
    // Calculate match scores for each food post
    const scoredPosts = availablePosts.map(post => {
      const distance = calculateDistance(userLocation, post.location.coordinates);
      
      // Skip posts that are too far away
      if (distance > maxDistance * 2) {
        return null;
      }
      
      const distanceScore = calculateDistanceMatch(distance, maxDistance);
      const foodTypeScore = calculateFoodTypeMatch(post, user.preferences);
      const dietaryScore = calculateDietaryMatch(post, user.preferences);
      
      // Calculate weighted total score
      const totalScore = (
        distanceScore * 0.5 + // Distance is most important
        foodTypeScore * 0.3 + // Food type preference
        dietaryScore * 0.2    // Dietary restrictions
      );
      
      return {
        post,
        score: totalScore,
        distance
      };
    }).filter(item => item !== null);
    
    // Sort by score (highest first) and take top results
    const recommendations = scoredPosts
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => ({
        ...item.post.toObject(),
        matchScore: Math.round(item.score * 100),
        distance: Math.round(item.distance * 10) / 10
      }));
    
    return recommendations;
  } catch (error) {
    console.error(`Error in getRecommendations: ${error.message}`);
    throw error;
  }
};

module.exports = {
  getRecommendations
};