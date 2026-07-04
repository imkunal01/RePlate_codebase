const User = require('../models/userModel');
const FoodPost = require('../models/foodModel');
const Claim = require('../models/claimModel');
const { notifyVerificationUpdate } = require('../services/notificationService');

/**
 * @desc    Get all users (with optional role filter)
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
const getAllUsers = async (req, res) => {
  try {
    const { role, verified, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (role) filter.roles = role;
    if (verified !== undefined) filter.isVerified = verified === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password -googleId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: users
    });
  } catch (error) {
    console.error(`Error in getAllUsers: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Get NGOs pending verification
 * @route   GET /api/admin/verifications/pending
 * @access  Private/Admin
 */
const getPendingVerifications = async (req, res) => {
  try {
    const pendingNGOs = await User.find({
      roles: 'recipient',
      isVerified: false,
      verificationStatus: 'pending'
    })
      .select('-password -googleId')
      .sort({ createdAt: 1 }); // Oldest first (FIFO)

    res.status(200).json({
      success: true,
      count: pendingNGOs.length,
      data: pendingNGOs
    });
  } catch (error) {
    console.error(`Error in getPendingVerifications: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Approve or reject an NGO's verification
 * @route   PATCH /api/admin/verify/:userId
 * @access  Private/Admin
 */
const verifyNGO = async (req, res) => {
  try {
    const { action, rejectionReason } = req.body; // action: 'approve' | 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Action must be 'approve' or 'reject'"
      });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (action === 'approve') {
      user.isVerified = true;
      user.verificationStatus = 'approved';
      user.verifiedAt = new Date();
      user.verifiedBy = req.user._id;
    } else {
      user.isVerified = false;
      user.verificationStatus = 'rejected';
      user.rejectionReason = rejectionReason || 'Does not meet verification criteria';
    }

    await user.save();

    // Send push notification to the NGO
    if (user.fcmToken) {
      await notifyVerificationUpdate(user.fcmToken, action === 'approve');
    }

    res.status(200).json({
      success: true,
      message: `NGO ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      data: user
    });
  } catch (error) {
    console.error(`Error in verifyNGO: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Get all donations (admin view with filters)
 * @route   GET /api/admin/donations
 * @access  Private/Admin
 */
const getAllDonations = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [donations, total] = await Promise.all([
      FoodPost.find(filter)
        .populate('donorId', 'name email orgName')
        .populate('claimedBy', 'name email orgName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      FoodPost.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      count: donations.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: donations
    });
  } catch (error) {
    console.error(`Error in getAllDonations: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Get admin dashboard overview stats
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
const getAdminStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalDonors,
      totalNGOs,
      pendingVerifications,
      totalDonations,
      activeDonations,
      completedDonations,
      totalMealsSaved
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ roles: 'donor' }),
      User.countDocuments({ roles: 'recipient' }),
      User.countDocuments({ roles: 'recipient', verificationStatus: 'pending' }),
      FoodPost.countDocuments(),
      FoodPost.countDocuments({ status: 'available' }),
      FoodPost.countDocuments({ status: 'completed' }),
      FoodPost.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$quantity.amount' } } }
      ])
    ]);

    const mealsSaved = totalMealsSaved[0]?.total || 0;

    res.status(200).json({
      success: true,
      data: {
        users: { total: totalUsers, donors: totalDonors, ngos: totalNGOs, pendingVerifications },
        donations: {
          total: totalDonations,
          active: activeDonations,
          completed: completedDonations,
          mealsSaved
        }
      }
    });
  } catch (error) {
    console.error(`Error in getAdminStats: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Delete a food post (admin override)
 * @route   DELETE /api/admin/donations/:id
 * @access  Private/Admin
 */
const adminDeleteDonation = async (req, res) => {
  try {
    const foodPost = await FoodPost.findByIdAndDelete(req.params.id);
    if (!foodPost) {
      return res.status(404).json({ success: false, message: 'Food post not found' });
    }

    // Also delete related claims
    await Claim.deleteMany({ foodId: req.params.id });

    res.status(200).json({ success: true, message: 'Donation deleted by admin' });
  } catch (error) {
    console.error(`Error in adminDeleteDonation: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getAllUsers,
  getPendingVerifications,
  verifyNGO,
  getAllDonations,
  getAdminStats,
  adminDeleteDonation
};
