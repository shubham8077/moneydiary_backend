import Subscription from '../models/Subscription.js';
import { validateSubscription } from '../utils/validate.js';

export const getSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ userId: req.user.id });
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createSubscription = async (req, res) => {
  const { title, amount, renewalDate } = req.body;

  try {
    const validationError = validateSubscription({ title, amount, renewalDate });
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const newSubscription = new Subscription({
      userId: req.user.id,
      title,
      amount: Number(amount),
      renewalDate: new Date(renewalDate),
    });

    const savedSubscription = await newSubscription.save();
    res.status(201).json(savedSubscription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSubscription = async (req, res) => {
  const { id } = req.params;
  const { title, amount, renewalDate } = req.body;

  try {
    const sub = await Subscription.findOne({ _id: id, userId: req.user.id });
    if (!sub) return res.status(404).json({ message: 'Subscription not found' });

    sub.title = title || sub.title;
    if (amount !== undefined) sub.amount = Number(amount);
    if (renewalDate) sub.renewalDate = new Date(renewalDate);

    const updatedSub = await sub.save();
    res.json(updatedSub);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteSubscription = async (req, res) => {
  const { id } = req.params;

  try {
    const sub = await Subscription.findOne({ _id: id, userId: req.user.id });
    if (!sub) return res.status(404).json({ message: 'Subscription not found' });

    await Subscription.deleteOne({ _id: id });
    res.json({ message: 'Subscription deleted successfully', id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
