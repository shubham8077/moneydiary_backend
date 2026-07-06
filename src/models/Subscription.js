import mongoose from './mongoose.js';

const SubscriptionSchema = new mongoose.Schema({
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
  renewalDate: {
    type: Date,
    required: true,
  },
}, {
  timestamps: true
});

export default mongoose.model('Subscription', SubscriptionSchema);
