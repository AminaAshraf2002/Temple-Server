const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  receiptNumber: { 
    type: String, 
    required: true, 
    unique: true 
  },
  devoteName: { 
    type: String, 
    required: true 
  },
  star: { 
    type: String, 
    required: true 
  },
  paymentMethod: { 
    type: String, 
    required: true 
  },
  poojaDate: { 
    type: String, 
    required: true 
  },
  poojaId: { 
    type: Number, 
    required: true 
  },
  poojaEnglish: { 
    type: String, 
    required: true 
  },
  pooja: { 
    type: String, 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  participantNumber: { 
    type: Number, 
    required: true 
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    default: null
  },
  // NEW: Required Cashfree fields
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  customerId: {
    type: String,
    required: true
  },
  cashfreeOrderId: {
    type: String
  },
  paymentSessionId: {
    type: String
  },
  paymentCompletedAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);