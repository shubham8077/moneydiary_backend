import mongoose from './mongoose.js';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: '',
  },
  currency: {
    type: String,
    default: 'INR',
  },
  theme: {
    type: String,
    enum: ['light', 'dark'],
    default: 'light',
  },
  savingsGoal: {
    type: Number,
    default: 0,
  },
  monthlyBudget: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('User', UserSchema);
