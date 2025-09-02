const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6
  },
  role: { 
    type: String, 
    enum: ['admin', 'super_admin'], 
    default: 'admin' 
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  createdBy: {
    type: String,
    default: 'system'
  }
}, {
  timestamps: true
});

// Hash password before saving
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
adminSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Update last login
adminSchema.methods.updateLastLogin = async function() {
  this.lastLogin = new Date();
  return await this.save();
};

// Static method to create default admin
adminSchema.statics.createDefaultAdmin = async function() {
  try {
    const existingAdmin = await this.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('Default admin already exists');
      return existingAdmin;
    }
    
    const defaultAdmin = new this({
      username: 'admin',
      password: 'temple123', // Will be hashed by pre-save middleware
      role: 'super_admin',
      createdBy: 'system'
    });
    
    await defaultAdmin.save();
    console.log('Default admin created successfully');
    console.log('Username: admin');
    console.log('Password: temple123');
    console.log('⚠️  IMPORTANT: Change this password in production!');
    
    return defaultAdmin;
  } catch (error) {
    console.error('Error creating default admin:', error);
    throw error;
  }
};

module.exports = mongoose.model('Admin', adminSchema);