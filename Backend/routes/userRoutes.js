const express = require('express');
const { updateProfile, switchRole, getUsers, deleteAccount } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

const router = express.Router();

// Protected routes
router.put('/profile', protect, updateProfile);
router.patch('/switch-role', protect, switchRole);
router.delete('/profile', protect, deleteAccount);

// Admin routes
router.get('/', protect, checkRole('admin'), getUsers);

module.exports = router;