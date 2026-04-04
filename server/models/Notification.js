const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type:      { type: String, enum: ['inquiry_received', 'inquiry_accepted', 'inquiry_declined', 'inquiry_reviewed'], required: true },
  message:   { type: String, required: true },
  inquiry:   { type: mongoose.Schema.Types.ObjectId, ref: 'Inquiry' },
  boarding:  { type: mongoose.Schema.Types.ObjectId, ref: 'Boarding' },
  isRead:    { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);