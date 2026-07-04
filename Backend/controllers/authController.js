const User = require('../models/userModel');
const { generateToken } = require('../utils/tokenUtils');
const { OAuth2Client } = require('google-auth-library');

// Initialize Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * @desc    Register a new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
const signup = async (req, res) => {
  try {
    const { name, email, password, location, preferences, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Determine roles based on input
    const activeRole = (role === 'donor' || role === 'recipient') ? role : 'recipient';
    const roles = ['recipient'];
    if (activeRole === 'donor') roles.push('donor');

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      location,
      preferences,
      activeRole,
      roles
    });

    if (user) {
      // Generate JWT token
      const token = generateToken(user._id);

      // Set JWT as cookie
      res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });

      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          roles: user.roles,
          activeRole: user.activeRole,
          token
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid user data'
      });
    }
  } catch (error) {
    console.error(`Error in signup: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update activeRole if role is provided and valid
    if (role && ['donor', 'recipient'].includes(role) && user.activeRole !== role) {
      user.activeRole = role;
      if (!user.roles.includes(role)) {
        user.roles.push(role);
      }
      await user.save();
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Set JWT as cookie
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        activeRole: user.activeRole,
        token
      }
    });
  } catch (error) {
    console.error(`Error in login: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Google OAuth login/signup
 * @route   POST /api/auth/google
 * @access  Public
 */
const googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user if doesn't exist
      user = await User.create({
        name,
        email,
        googleId,
        location: req.body.location || {
          type: 'Point',
          coordinates: [0, 0], // Default coordinates
          address: 'Please update your address'
        }
      });
    } else {
      // Update googleId if user exists but doesn't have googleId
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Set JWT as cookie
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        activeRole: user.activeRole,
        token
      }
    });
  } catch (error) {
    console.error(`Error in Google auth: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error with Google authentication',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = (req, res) => {
  // Clear JWT cookie
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0)
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error(`Error in getMe: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get Google Auth URL for testing
 * @route   GET /api/auth/google/url
 * @access  Public
 */
const getGoogleAuthURL = (req, res) => {
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  // Use the frontend URL for the redirect
  const redirectUri = `http://localhost:5173`;
  const options = {
    redirect_uri: redirectUri,
    client_id: process.env.GOOGLE_CLIENT_ID,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ].join(' ')
  };

  const qs = new URLSearchParams(options);
  const url = `${rootUrl}?${qs.toString()}`;

  res.status(200).json({
    success: true,
    url
  });
};

/**
 * @desc    Handle Google OAuth callback
 * @route   GET /api/auth/google/callback
 * @access  Public
 */
const googleCallback = async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code is required'
      });
    }

    // Exchange code for tokens
    const redirectUri = `http://localhost:${process.env.PORT || 5000}/api/auth/google/callback`;
    const { tokens } = await client.getToken({
      code,
      redirect_uri: redirectUri,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET
    });

    // Get user info with access token
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user if doesn't exist
      user = await User.create({
        name,
        email,
        googleId,
        location: {
          type: 'Point',
          coordinates: [0, 0], // Default coordinates
          address: 'Please update your address'
        }
      });
    } else {
      // Update googleId if user exists but doesn't have googleId
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Set JWT as cookie
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    // For testing in Postman, return token in response body
    res.status(200).json({
      success: true,
      message: 'Google authentication successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        activeRole: user.activeRole,
        token
      }
    });
  } catch (error) {
    console.error(`Error in Google callback: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error with Google authentication callback',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  signup,
  login,
  googleAuth,
  logout,
  getMe,
  getGoogleAuthURL,
  googleCallback
};