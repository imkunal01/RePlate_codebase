const mongoose = require('mongoose');

/**
 * Claim Schema
 * Defines the structure for food claim records in the database
 */
const claimSchema = new mongoose.Schema({
  foodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodPost',
    required: true
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'completed', 'cancelled'],
    default: 'pending'
  },
  claimedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

const Claim = mongoose.model('Claim', claimSchema);

module.exports = Claim;