import mongoose from './mongoose.js';

const TransactionSchema = new mongoose.Schema({
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
    type: String, // From account, or source account
    required: true,
  },
  toAccount: {
    type: String, // Target account, only used if type is 'transfer'
    default: '',
  },
  note: {
    type: String,
    default: '',
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  receipt: {
    type: String, // Cloudinary or base64 URL
    default: '',
  },
  tags: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Transaction', TransactionSchema);
