const mongoose = require('mongoose');

const starSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    unique: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Star', starSchema);