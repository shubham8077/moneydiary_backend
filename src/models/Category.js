import mongoose from './mongoose.js';

const CategorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null, // null means global/system category
  },
  type: {
    type: String,
    enum: ['income', 'expense', 'saving', 'transfer'],
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  color: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
});

// Compound unique key to avoid duplicate categories for the same user
CategorySchema.index({ userId: 1, name: 1, type: 1 }, { unique: true });

export default mongoose.model('Category', CategorySchema);
