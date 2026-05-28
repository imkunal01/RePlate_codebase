const User = require('../models/userModel');

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update allowed fields
    if (req.body.name) user.name = req.body.name;
    if (req.body.location) user.location = req.body.location;
    if (req.body.preferences) user.preferences = req.body.preferences;
    
    // Only update password if provided
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        roles: updatedUser.roles,
        activeRole: updatedUser.activeRole,
        location: updatedUser.location,
        preferences: updatedUser.preferences
      }
    });
  } catch (error) {
    console.error(`Error in updateProfile: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Switch user's active role
 * @route   PATCH /api/users/switch-role
 * @access  Private
 */
const switchRole = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { role } = req.body;

    // Validate requested role
    if (!role || !['donor', 'recipient'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified. Must be "donor" or "recipient"'
      });
    }

    // Check if user has the requested role
    if (!user.roles.includes(role)) {
      // Add the role if user doesn't have it
      user.roles.push(role);
    }

    // Set active role
    user.activeRole = role;
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        activeRole: user.activeRole,
        roles: user.roles
      },
      message: `Successfully switched to ${role} role`
    });
  } catch (error) {
    console.error(`Error in switchRole: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get all users (admin only)
 * @route   GET /api/users
 * @access  Private/Admin
 */
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error(`Error in getUsers: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Delete user account
 * @route   DELETE /api/users/profile
 * @access  Private
 */
const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.remove();

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error(`Error in deleteAccount: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  updateProfile,
  switchRole,
  getUsers,
  deleteAccount
};