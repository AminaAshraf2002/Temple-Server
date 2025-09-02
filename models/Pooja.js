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
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  category: { 
    type: String, 
    enum: ['regular', 'special', 'festival'], 
    default: 'regular' 
  },
  special: { 
    type: Boolean, 
    default: false 
  },
  maxParticipants: { 
    type: Number, 
    default: 100 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Pooja', poojaSchema);