import Category from '../models/Category.js';

// Pre-defined global categories
const defaultCategories = [
  // Expenses
  { type: 'expense', name: 'Shopping', color: '#EF4444', icon: 'ShoppingBag' },
  { type: 'expense', name: 'Food', color: '#F59E0B', icon: 'Utensils' },
  { type: 'expense', name: 'Phone', color: '#3B82F6', icon: 'Phone' },
  { type: 'expense', name: 'Entertainment', color: '#8B5CF6', icon: 'Film' },
  { type: 'expense', name: 'Education', color: '#10B981', icon: 'GraduationCap' },
  { type: 'expense', name: 'Beauty', color: '#EC4899', icon: 'Sparkles' },
  { type: 'expense', name: 'Sports', color: '#06B6D4', icon: 'Activity' },
  { type: 'expense', name: 'Social', color: '#14B8A6', icon: 'Heart' },
  { type: 'expense', name: 'Transportation', color: '#6366F1', icon: 'Bus' },
  { type: 'expense', name: 'Clothing', color: '#84CC16', icon: 'Shirt' },
  { type: 'expense', name: 'Car', color: '#4B5563', icon: 'Car' },
  { type: 'expense', name: 'Alcohol', color: '#991B1B', icon: 'GlassWater' },
  { type: 'expense', name: 'Cigarettes', color: '#78350F', icon: 'Flame' },
  { type: 'expense', name: 'Electronics', color: '#2563EB', icon: 'Laptop' },
  { type: 'expense', name: 'Travel', color: '#0EA5E9', icon: 'Plane' },
  { type: 'expense', name: 'Health', color: '#10B981', icon: 'HeartPulse' },
  { type: 'expense', name: 'Pets', color: '#F59E0B', icon: 'Dog' },
  { type: 'expense', name: 'Repair', color: '#6B7280', icon: 'Wrench' },
  { type: 'expense', name: 'Rent', color: '#D97706', icon: 'Home' },
  { type: 'expense', name: 'Bills', color: '#EF4444', icon: 'Receipt' },
  { type: 'expense', name: 'Groceries', color: '#10B981', icon: 'ShoppingCart' },
  { type: 'expense', name: 'Fuel', color: '#B45309', icon: 'Fuel' },
  { type: 'expense', name: 'Investment', color: '#8B5CF6', icon: 'TrendingUp' },
  { type: 'expense', name: 'Insurance', color: '#4F46E5', icon: 'ShieldCheck' },
  { type: 'expense', name: 'Tax', color: '#DC2626', icon: 'Percent' },
  { type: 'expense', name: 'Medical', color: '#EF4444', icon: 'Stethoscope' },
  { type: 'expense', name: 'Utilities', color: '#0EA5E9', icon: 'Lightbulb' },
  { type: 'expense', name: 'Internet', color: '#2563EB', icon: 'Wifi' },
  { type: 'expense', name: 'Gym', color: '#EC4899', icon: 'Dumbbell' },
  { type: 'expense', name: 'Others', color: '#6B7280', icon: 'HelpCircle' },

  // Income
  { type: 'income', name: 'Salary', color: '#10B981', icon: 'Briefcase' },
  { type: 'income', name: 'Freelancing', color: '#0EA5E9', icon: 'LaptopCode' },
  { type: 'income', name: 'Business', color: '#8B5CF6', icon: 'Building' },
  { type: 'income', name: 'Bonus', color: '#F59E0B', icon: 'Award' },
  { type: 'income', name: 'Commission', color: '#D97706', icon: 'Coins' },
  { type: 'income', name: 'Gift', color: '#EC4899', icon: 'Gift' },
  { type: 'income', name: 'Interest', color: '#06B6D4', icon: 'TrendingUp' },
  { type: 'income', name: 'Refund', color: '#6B7280', icon: 'Undo' },
  { type: 'income', name: 'Rental', color: '#B45309', icon: 'Home' },
  { type: 'income', name: 'Investment', color: '#8B5CF6', icon: 'PiggyBank' },
  { type: 'income', name: 'Cashback', color: '#10B981', icon: 'Percent' },
  { type: 'income', name: 'Others', color: '#6B7280', icon: 'HelpCircle' },

  // Savings
  { type: 'saving', name: 'Emergency Fund', color: '#EF4444', icon: 'ShieldAlert' },
  { type: 'saving', name: 'Vacation', color: '#0EA5E9', icon: 'Compass' },
  { type: 'saving', name: 'Car Fund', color: '#F59E0B', icon: 'Car' },
  { type: 'saving', name: 'House Fund', color: '#8B5CF6', icon: 'Home' },
  { type: 'saving', name: 'Investment Fund', color: '#10B981', icon: 'LineChart' },
  { type: 'saving', name: 'Others', color: '#6B7280', icon: 'HelpCircle' },

  // Transfers
  { type: 'transfer', name: 'Transfer', color: '#2563EB', icon: 'ArrowLeftRight' }
];

export const getCategories = async (req, res) => {
  try {
    // Find all custom categories for this user, plus any global categories (userId: null)
    let categories = await Category.find({
      $or: [{ userId: null }, { userId: req.user.id }],
    });

    // If no categories in DB at all, seed global ones
    const globalCount = await Category.countDocuments({ userId: null });
    if (globalCount === 0) {
      console.log('Seeding default categories...');
      await Category.insertMany(defaultCategories.map(c => ({ ...c, userId: null })));
      // Refetch
      categories = await Category.find({
        $or: [{ userId: null }, { userId: req.user.id }],
      });
    }

    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCategory = async (req, res) => {
  const { type, name, color, icon } = req.body;

  try {
    if (!type || !name || !color || !icon) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check for duplicates
    const duplicate = await Category.findOne({ userId: req.user.id, name, type });
    if (duplicate) {
      return res.status(400).json({ message: 'Category with this name and type already exists' });
    }

    const newCategory = new Category({
      userId: req.user.id,
      type,
      name,
      color,
      icon,
    });

    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, color, icon } = req.body;

  try {
    const category = await Category.findOne({ _id: id, userId: req.user.id });
    if (!category) {
      return res.status(404).json({ message: 'Category not found or you do not have permission to modify it' });
    }

    category.name = name || category.name;
    category.color = color || category.color;
    category.icon = icon || category.icon;

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await Category.findOne({ _id: id, userId: req.user.id });
    if (!category) {
      return res.status(404).json({ message: 'Category not found or you do not have permission to delete it' });
    }

    await Category.deleteOne({ _id: id });
    res.json({ message: 'Category deleted successfully', id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
