import Reminder from '../models/Reminder.js';
import { validateReminder } from '../utils/validate.js';

export const getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({ userId: req.user.id }).sort({ date: 1 });
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createReminder = async (req, res) => {
  const { title, date, type, completed } = req.body;

  try {
    const validationError = validateReminder({ title, date });
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const newReminder = new Reminder({
      userId: req.user.id,
      title,
      date: new Date(date),
      type: type || 'custom',
      completed: !!completed,
    });

    const savedReminder = await newReminder.save();
    res.status(201).json(savedReminder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateReminder = async (req, res) => {
  const { id } = req.params;
  const { title, date, type, completed } = req.body;

  try {
    const reminder = await Reminder.findOne({ _id: id, userId: req.user.id });
    if (!reminder) return res.status(404).json({ message: 'Reminder not found' });

    reminder.title = title || reminder.title;
    if (date) reminder.date = new Date(date);
    if (type) reminder.type = type;
    if (completed !== undefined) reminder.completed = !!completed;

    const updatedReminder = await reminder.save();
    res.json(updatedReminder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteReminder = async (req, res) => {
  const { id } = req.params;

  try {
    const reminder = await Reminder.findOne({ _id: id, userId: req.user.id });
    if (!reminder) return res.status(404).json({ message: 'Reminder not found' });

    await Reminder.deleteOne({ _id: id });
    res.json({ message: 'Reminder deleted successfully', id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
