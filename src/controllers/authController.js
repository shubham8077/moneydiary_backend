import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { getJwtSecret } from '../config/env.js';
import { validateRegister, validateLogin, validateProfileUpdate } from '../utils/validate.js';

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const validationError = validateRegister({ name, email, password });
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();

    const token = jwt.sign(
      { id: savedUser._id },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        currency: savedUser.currency,
        theme: savedUser.theme,
        savingsGoal: savedUser.savingsGoal,
        monthlyBudget: savedUser.monthlyBudget,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const validationError = validateLogin({ email, password });
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        theme: user.theme,
        savingsGoal: user.savingsGoal,
        monthlyBudget: user.monthlyBudget,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Return the same shape as login/register so the frontend always gets { id, name, ... }
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      currency: user.currency,
      theme: user.theme,
      savingsGoal: user.savingsGoal,
      monthlyBudget: user.monthlyBudget,
      avatar: user.avatar,
      createdAt: user.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, avatar, currency, theme, savingsGoal, monthlyBudget } = req.body;

    const validationError = validateProfileUpdate({ name, theme, savingsGoal, monthlyBudget });
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name.trim();
    if (avatar !== undefined) user.avatar = avatar;
    if (currency) user.currency = currency;
    if (theme) user.theme = theme;
    if (savingsGoal !== undefined) user.savingsGoal = Number(savingsGoal);
    if (monthlyBudget !== undefined) user.monthlyBudget = Number(monthlyBudget);

    const updatedUser = await user.save();
    
    res.json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      currency: updatedUser.currency,
      theme: updatedUser.theme,
      savingsGoal: updatedUser.savingsGoal,
      monthlyBudget: updatedUser.monthlyBudget,
      avatar: updatedUser.avatar,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
