import Budget from '../models/Budget.js';
import { validateBudget } from '../utils/validate.js';

export const getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user.id });
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createBudget = async (req, res) => {
  const { category, limit, period, icon, color, isRecurring } = req.body;

  try {
    const validationError = validateBudget({ category, limit });
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    // Check for duplicates (same category & period for the user)
    const duplicate = await Budget.findOne({ userId: req.user.id, category, period: period || 'monthly' });
    if (duplicate) {
      return res.status(400).json({ message: 'Budget limit for this category/period already exists' });
    }

    const newBudget = new Budget({
      userId: req.user.id,
      category,
      limit: Number(limit),
      period: period || 'monthly',
      icon,
      color,
      isRecurring,
    });

    const savedBudget = await newBudget.save();
    res.status(201).json(savedBudget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBudget = async (req, res) => {
  const { id } = req.params;
  const { category, limit, period, icon, color, isRecurring } = req.body;

  try {
    const budget = await Budget.findOne({ _id: id, userId: req.user.id });
    if (!budget) return res.status(404).json({ message: 'Budget not found' });

    budget.category = category || budget.category;
    if (limit !== undefined) budget.limit = Number(limit);
    budget.period = period || budget.period;
    if (icon !== undefined) budget.icon = icon;
    if (color !== undefined) budget.color = color;
    if (isRecurring !== undefined) budget.isRecurring = isRecurring;

    const updatedBudget = await budget.save();
    res.json(updatedBudget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteBudget = async (req, res) => {
  const { id } = req.params;

  try {
    const budget = await Budget.findOne({ _id: id, userId: req.user.id });
    if (!budget) return res.status(404).json({ message: 'Budget not found' });

    await Budget.deleteOne({ _id: id });
    res.json({ message: 'Budget deleted successfully', id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
