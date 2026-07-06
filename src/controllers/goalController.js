import Goal from '../models/Goal.js';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import { validateGoal, validateContribution, isNonNegativeNumber } from '../utils/validate.js';

export const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user.id });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createGoal = async (req, res) => {
  const { title, targetAmount, currentAmount, targetDate, color, icon } = req.body;

  try {
    const validationError = validateGoal({ title, targetAmount, targetDate, color, icon });
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }
    if (currentAmount !== undefined && !isNonNegativeNumber(currentAmount)) {
      return res.status(400).json({ message: 'Current amount cannot be negative' });
    }

    const newGoal = new Goal({
      userId: req.user.id,
      title,
      targetAmount: Number(targetAmount),
      currentAmount: currentAmount !== undefined ? Number(currentAmount) : 0,
      targetDate: new Date(targetDate),
      color,
      icon,
    });

    const savedGoal = await newGoal.save();
    res.status(201).json(savedGoal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateGoal = async (req, res) => {
  const { id } = req.params;
  const { title, targetAmount, currentAmount, targetDate, color, icon } = req.body;

  try {
    const goal = await Goal.findOne({ _id: id, userId: req.user.id });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });

    goal.title = title || goal.title;
    if (targetAmount !== undefined) goal.targetAmount = Number(targetAmount);
    if (currentAmount !== undefined) goal.currentAmount = Number(currentAmount);
    if (targetDate) goal.targetDate = new Date(targetDate);
    goal.color = color || goal.color;
    goal.icon = icon || goal.icon;

    const updatedGoal = await goal.save();
    res.json(updatedGoal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteGoal = async (req, res) => {
  const { id } = req.params;

  try {
    const goal = await Goal.findOne({ _id: id, userId: req.user.id });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });

    await Goal.deleteOne({ _id: id });
    res.json({ message: 'Goal deleted successfully', id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const contributeToGoal = async (req, res) => {
  const { id } = req.params;
  const { amount, accountName } = req.body;

  try {
    const validationError = validateContribution({ amount, accountName });
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const goal = await Goal.findOne({ _id: id, userId: req.user.id });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });

    const account = await Account.findOne({ userId: req.user.id, name: accountName });
    if (!account) return res.status(404).json({ message: 'Account not found' });

    // Deduct from account
    account.balance -= Number(amount);
    await account.save();

    // Add to goal
    goal.currentAmount += Number(amount);
    const updatedGoal = await goal.save();

    // Create a transaction record of type 'saving'
    const newTx = new Transaction({
      userId: req.user.id,
      title: `Saved to ${goal.title}`,
      amount: Number(amount),
      type: 'saving',
      category: 'Emergency Fund', // Default to saving category, or match goal
      account: accountName,
      note: `Contribution to goal: ${goal.title}`,
      date: new Date(),
    });
    await newTx.save();

    res.json({ goal: updatedGoal, account });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
