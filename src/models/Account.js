import mongoose from './mongoose.js';

const AccountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: [
      'Cash', 'Debit Card', 'Credit Card', 'Bank Account', 'UPI',
      'Investment', 'Receivables', 'Payables', 'Crypto Wallet',
      'Savings Account', 'Fixed Deposit', 'Mutual Fund', 'Stock Portfolio'
    ],
    required: true,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  balance: {
    type: Number,
    default: 0,
  },
  icon: {
    type: String,
    required: true,
  },
  excludeFromTotals: {
    type: Boolean,
    default: false,
  },
  note: {
    type: String,
    default: '',
  },
}, {
  timestamps: true
});

export default mongoose.model('Account', AccountSchema);
