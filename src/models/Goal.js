import mongoose from './mongoose.js';

const GoalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  targetAmount: {
    type: Number,
    required: true,
  },
  currentAmount: {
    type: Number,
    default: 0,
  },
  targetDate: {
    type: Date,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
}, {
  timestamps: true
});

export default mongoose.model('Goal', GoalSchema);
