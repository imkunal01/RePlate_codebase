const mongoose = require('mongoose');

/**
 * Food Post Schema
 * Defines the structure for food donation posts in the database
 */
const foodPostSchema = new mongoose.Schema({
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please provide a name for the food'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Please specify food type'],
    enum: ['cooked', 'packaged', 'fresh', 'canned', 'bakery', 'dairy', 'other']
  },
  quantity: {
    amount: {
      type: Number,
      required: [true, 'Please specify quantity amount'],
      min: [1, 'Quantity must be at least 1']
    },
    unit: {
      type: String,
      required: [true, 'Please specify quantity unit'],
      enum: ['servings', 'kg', 'lbs', 'items', 'packages']
    }
  },
  expiryTime: {
    type: Date,
    required: [true, 'Please specify when the food will expire']
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: [true, 'Please provide location coordinates']
    },
    address: {
      type: String,
      required: [true, 'Please provide an address']
    }
  },
  status: {
    type: String,
    enum: ['available', 'claimed', 'completed', 'expired'],
    default: 'available'
  },
  claimedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  pickupInstructions: {
    type: String,
    default: ''
  },
  dietaryInfo: {
    vegetarian: { type: Boolean, default: false },
    vegan: { type: Boolean, default: false },
    glutenFree: { type: Boolean, default: false },
    nutFree: { type: Boolean, default: false },
    dairyFree: { type: Boolean, default: false }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create index for geospatial queries
foodPostSchema.index({ location: '2dsphere' });
// Create index for expiry time to easily find expired posts
foodPostSchema.index({ expiryTime: 1 });

const FoodPost = mongoose.model('FoodPost', foodPostSchema);

module.exports = FoodPost;