// ============================================
// Boarding Place Model
// ============================================
const mongoose = require('mongoose');

const boardingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    // Google Maps coordinates
    lat: {
      type: Number,
      default: null,
    },
    lng: {
      type: Number,
      default: null,
    },
    // Image filename stored in /uploads
    image: {
      type: String,
      default: null,
    },
    // Room type
    roomType: {
      type: String,
      enum: ['Single', 'Double', 'Triple', 'Annex', 'Other'],
      default: 'Single',
    },
    // Amenities list
    amenities: {
      type: [String],
      default: [],
    },
    // Owner of this boarding listing
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Contact number
    contact: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Text index for search
boardingSchema.index({ title: 'text', location: 'text', description: 'text' });

module.exports = mongoose.model('Boarding', boardingSchema);