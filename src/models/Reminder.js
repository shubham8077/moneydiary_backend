import mongoose from './mongoose.js';

const ReminderSchema = new mongoose.Schema({
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
  date: {
    type: Date,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    enum: ['bill', 'subscription', 'salary', 'investment', 'custom'],
    default: 'custom',
  },
}, {
  timestamps: true
});

export default mongoose.model('Reminder', ReminderSchema);
