import RecurringTransaction from '../models/RecurringTransaction.js';

export const getRecurringTransactions = async (req, res) => {
  try {
    const recurring = await RecurringTransaction.find({ userId: req.user.id });
    res.json(recurring);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createRecurringTransaction = async (req, res) => {
  const { frequency, nextDate, title, amount, type, category, account, toAccount } = req.body;

  try {
    if (!frequency || !nextDate || !title || !amount || !type || !category || !account) {
      return res.status(400).json({ message: 'All required fields must be supplied' });
    }

    const newRecurring = new RecurringTransaction({
      userId: req.user.id,
      frequency,
      nextDate: new Date(nextDate),
      title,
      amount: Number(amount),
      type,
      category,
      account,
      toAccount: toAccount || '',
    });

    const savedRecurring = await newRecurring.save();
    res.status(201).json(savedRecurring);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateRecurringTransaction = async (req, res) => {
  const { id } = req.params;
  const { frequency, nextDate, title, amount, type, category, account, toAccount } = req.body;

  try {
    const rec = await RecurringTransaction.findOne({ _id: id, userId: req.user.id });
    if (!rec) return res.status(404).json({ message: 'Recurring transaction not found' });

    rec.frequency = frequency || rec.frequency;
    if (nextDate) rec.nextDate = new Date(nextDate);
    rec.title = title || rec.title;
    if (amount !== undefined) rec.amount = Number(amount);
    rec.type = type || rec.type;
    rec.category = category || rec.category;
    rec.account = account || rec.account;
    if (toAccount !== undefined) rec.toAccount = toAccount;

    const updatedRec = await rec.save();
    res.json(updatedRec);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteRecurringTransaction = async (req, res) => {
  const { id } = req.params;

  try {
    const rec = await RecurringTransaction.findOne({ _id: id, userId: req.user.id });
    if (!rec) return res.status(404).json({ message: 'Recurring transaction not found' });

    await RecurringTransaction.deleteOne({ _id: id });
    res.json({ message: 'Recurring transaction deleted successfully', id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
