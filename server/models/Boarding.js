const mongoose = require('mongoose');

const boardingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    location: { type: String, required: true },
    lat: { type: Number },
    lng: { type: Number },
    image: { type: String },
    images: [{ type: String }],
    roomType: { type: String, default: 'Single', enum: ['Single','Double','Triple','Annex','Other'] },
    amenities: [{ type: String }],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    contact: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Boarding', boardingSchema);
