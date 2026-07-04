const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');
const {
  getAllUsers,
  getPendingVerifications,
  verifyNGO,
  getAllDonations,
  getAdminStats,
  adminDeleteDonation
} = require('../controllers/adminController');

const router = express.Router();

// All admin routes require authentication + admin role
router.use(protect, checkRole('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.get('/verifications/pending', getPendingVerifications);
router.patch('/verify/:userId', verifyNGO);
router.get('/donations', getAllDonations);
router.delete('/donations/:id', adminDeleteDonation);

module.exports = router;
