const { verifyToken } = require('../utils/tokenUtils');
const User = require('../models/userModel');

/**
 * Middleware to protect routes that require authentication
 * Verifies JWT token from Authorization header or cookies
 */
const protect = async (req, res, next) => {
  try {
    let token;
    
    // Check for token in Authorization header (Bearer token)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } 
    // Check for token in cookies
    else if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    // If no token found, return unauthorized error
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized, no token provided' 
      });
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized, token failed' 
      });
    }

    // Get user from database
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error(`Auth middleware error: ${error.message}`);
    res.status(401).json({ 
      success: false, 
      message: 'Not authorized, token failed' 
    });
  }
};

module.exports = { protect };