const mongoose = require('mongoose');

const poojaSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  poojaEnglish: {
    type: String,
    required: true
  },
  pooja: {
    type: String,
    required: true
  }, // Malayalam name
  malayalamDate: {
    type: String,
    required: true
  },
  day: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: false // Allow null for always-available poojas
  },
  amount: {
    type: Number,
    required: false // Allow null for parent categories
  },
  category: {
    type: String,
    enum: ['regular', 'special', 'festival', 'premium', 'parent', 'subcategory'],
    default: 'regular'
  },
  special: {
    type: Boolean,
    default: false
  },
  maxParticipants: {
  type: Number,
  default: null, // <-- CHANGE TO null
  required: false
},
  
  // NEW ENHANCED FIELDS FOR SUBCATEGORIES AND DESCRIPTIONS
  parentCategory: {
    type: String,
    required: false // Only required for subcategories
  },
  
  description: {
    type: String,
    required: false // Malayalam description
  },
  
  descriptionEnglish: {
    type: String,
    required: false // English description
  },
  
  hasSubcategories: {
    type: Boolean,
    default: false // True for parent categories
  },
  
  // BOOKING REQUIREMENT FLAGS
  requiresAdvanceBooking: {
    type: Boolean,
    default: false
  },
  
  requiresDirectVisit: {
    type: Boolean,
    default: false
  },
  
  requiresNotification: {
    type: Boolean,
    default: false
  },
  
  requiresBooking: {
    type: Boolean,
    default: false
  },
  
  // NEW: Online booking availability
  onlineBookingAvailable: {
    type: Boolean,
    default: false
  },
  
  isComprehensiveRitual: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Method to get booking requirements
poojaSchema.methods.getBookingRequirements = function() {
  const requirements = [];
  
  if (this.requiresAdvanceBooking) {
    requirements.push('Advance booking required');
  }
  
  if (this.requiresDirectVisit) {
    requirements.push('Direct visit to temple required');
  }
  
  if (this.requiresNotification) {
    requirements.push('Prior notification to temple authorities required');
  }
  
  if (this.requiresBooking) {
    requirements.push('Booking required for this ritual');
  }
  
  if (this.onlineBookingAvailable) {
    requirements.push('Online booking available');
  }
  
  if (this.isComprehensiveRitual) {
    requirements.push('This is a comprehensive ritual with multiple components');
  }
  
  return requirements;
};

module.exports = mongoose.model('Pooja', poojaSchema);