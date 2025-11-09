import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email']
  },
  
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[1-9]\d{1,14}$/, 'Please provide a valid phone number']
  },
  
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  
  role: {
    type: String,
    enum: ['seller', 'buyer', 'agent', 'admin'],
    default: 'buyer'
  },
  
  // Account status
  status: {
    type: String,
    enum: ['active', 'suspended'],
    default: 'active'
  },
  
  // Legacy fields - kept for backward compatibility
  isActive: {
    type: Boolean,
    default: true
  },
  
  isSuspended: {
    type: Boolean,
    default: false
  },
  
  // Soft delete implementation
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },
  
  deletedAt: {
    type: Date,
    default: null
  },
  
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Security fields
  lastLogin: {
    type: Date
  },
  
  // Verification
  isVerified: {
    type: Boolean,
    default: false
  },
  
  // Preferences
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    smsNotifications: {
      type: Boolean,
      default: false
    },
    marketingEmails: {
      type: Boolean,
      default: false
    }
  },
  
  // Add favorites field to store user's favorite properties
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property'
  }]
}, {
  timestamps: true
});

// Advanced indexing strategy
userSchema.index({ email: 1, isDeleted: 1 });
userSchema.index({ role: 1, isDeleted: 1, isActive: 1 });
userSchema.index({ createdAt: -1 });

// Query helpers
userSchema.query.active = function() {
  return this.where({ isDeleted: false, isActive: true });
};

userSchema.query.buyers = function() {
  return this.where({ role: 'buyer', isDeleted: false, isActive: true });
};

export default mongoose.models.User || mongoose.model('User', userSchema);