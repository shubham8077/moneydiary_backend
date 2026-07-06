import mongoose from './mongoose.js';

const RecurringTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom'],
    required: true,
  },
  nextDate: {
    type: Date,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ['income', 'expense', 'saving', 'transfer'],
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  account: {
    type: String,
    required: true,
  },
  toAccount: {
    type: String,
    default: '',
  },
}, {
  timestamps: true
});

export default mongoose.model('RecurringTransaction', RecurringTransactionSchema);
