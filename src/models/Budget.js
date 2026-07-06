import mongoose from './mongoose.js';

const BudgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    required: true, // "Overall" or specific category name
    trim: true,
  },
  limit: {
    type: Number,
    required: true,
  },
  period: {
    type: String,
    enum: ['monthly', 'yearly', 'custom'],
    default: 'monthly',
  },
  icon: {
    type: String,
    default: 'wallet',
  },
  color: {
    type: String,
    default: '#84BA63',
  },
  isRecurring: {
    type: Boolean,
    default: true,
  },
  customLimit: {
    type: Number,
  },
}, {
  timestamps: true
});

export default mongoose.model('Budget', BudgetSchema);
