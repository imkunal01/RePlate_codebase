const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema
 * Defines the structure for user data in the database
 */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId; // Password is required only if not using Google auth
    },
    minlength: [6, 'Password must be at least 6 characters']
  },
  googleId: {
    type: String
  },
  // ─── Organization info ───────────────────────────────────────────
  phone: {
    type: String,
    trim: true
  },
  orgName: {
    type: String,
    trim: true
  },
  orgType: {
    type: String,
    enum: ['restaurant', 'hotel', 'bakery', 'hostel', 'caterer', 'event_organizer', 'grocery', 'ngo', 'community_kitchen', 'orphanage', 'old_age_home', 'food_bank', 'disaster_relief', 'household', 'other'],
    default: 'other'
  },
  profilePhoto: {
    type: String,
    default: ''
  },

  // ─── Auth & roles ─────────────────────────────────────────────────
  roles: {
    type: [String],
    enum: ['donor', 'recipient', 'admin'],
    default: ['recipient']
  },
  activeRole: {
    type: String,
    enum: ['donor', 'recipient'],
    default: 'recipient'
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
  preferences: {
    foodTypes: {
      type: [String],
      default: []
    },
    dietaryRestrictions: {
      type: [String],
      default: []
    },
    maxDistance: {
      type: Number,
      default: 10 // in kilometers
    }
  },
  // ─── FCM / Push notifications ─────────────────────────────────────
  fcmToken: {
    type: String,
    default: ''
  },

  // ─── NGO Verification ─────────────────────────────────────────────
  // isVerified: true means the NGO has been approved by an admin
  isVerified: {
    type: Boolean,
    default: false
  },
  // verificationStatus: 'none' (default) | 'pending' | 'approved' | 'rejected'
  verificationStatus: {
    type: String,
    enum: ['none', 'pending', 'approved', 'rejected'],
    default: 'none'
  },
  verifiedAt: {
    type: Date
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectionReason: {
    type: String
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create index for geospatial queries
userSchema.index({ location: '2dsphere' });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.matchPassword = async function(enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;