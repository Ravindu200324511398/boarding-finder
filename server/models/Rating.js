const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
  {
    boarding: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Boarding',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    stars: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

// One rating per user per boarding
ratingSchema.index({ boarding: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);
