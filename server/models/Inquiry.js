const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema(
  {
    boarding: { type: mongoose.Schema.Types.ObjectId, ref: 'Boarding', required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    visitDate: { type: Date },
    message: { type: String, required: true },
    status: { type: String, default: 'pending', enum: ['pending', 'seen', 'accepted', 'rejected'] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Inquiry', inquirySchema);
