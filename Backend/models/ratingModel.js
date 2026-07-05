const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  foodPostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodPost',
    required: true
  },
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

// A user can only rate another user once per food post
ratingSchema.index({ foodPostId: 1, fromUser: 1 }, { unique: true });

const Rating = mongoose.model('Rating', ratingSchema);

module.exports = Rating;
