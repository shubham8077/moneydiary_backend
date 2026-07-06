import Transaction from '../models/Transaction.js';
import Account from '../models/Account.js';
import { uploadToCloudinary } from '../config/cloudinary.js';
import { extractDataFromImage } from '../services/ocrService.js';
import { validateTransaction } from '../utils/validate.js';

// Helper function to update account balance
const updateAccountBalance = async (userId, accountName, amount, type, action) => {
  if (!accountName) return;
  const account = await Account.findOne({ userId, name: accountName });
  if (!account) {
    console.warn(`[updateAccountBalance] Account not found: userId=${userId}, name="${accountName}"`);
    return;
  }

  // action: 'apply' (adding transaction) or 'reverse' (deleting/modifying transaction)
  let delta = 0;
  if (type === 'income') {
    delta = action === 'apply' ? amount : -amount;
  } else if (type === 'expense' || type === 'saving') {
    delta = action === 'apply' ? -amount : amount;
  }

  account.balance += delta;
  await account.save();
};

export const getTransactions = async (req, res) => {
  const { startDate, endDate, type, category, account, search, limit = 100, skip = 0 } = req.query;

  const filter = { userId: req.user.id };

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  if (type) filter.type = type;
  if (category) filter.category = category;

  const conditions = [];
  
  if (account) {
    // Matches source account or target account
    conditions.push({ $or: [{ account: account }, { toAccount: account }] });
  }

  if (search) {
    conditions.push({
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { note: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ]
    });
  }

  if (conditions.length > 0) {
    filter.$and = conditions;
  }

  try {
    const transactions = await Transaction.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip));
    
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createTransaction = async (req, res) => {
  const { title, amount, type, category, account, toAccount, note, date, tags } = req.body;

  try {
    const validationError = validateTransaction({ title, amount, type, category, account, toAccount });
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const transaction = new Transaction({
      userId: req.user.id,
      title,
      amount: Number(amount),
      type,
      category,
      account,
      toAccount,
      note,
      date: date ? new Date(date) : new Date(),
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []),
    });

    // If receipt was uploaded, req.file will be present
    if (req.file) {
      const receiptUrl = await uploadToCloudinary(req.file.buffer, req.file.originalname);
      transaction.receipt = receiptUrl;
    }

    const savedTransaction = await transaction.save();

    // Adjust Account Balance
    if (type === 'transfer') {
      // Deduct from sender
      const fromAcc = await Account.findOne({ userId: req.user.id, name: account });
      if (fromAcc) {
        fromAcc.balance -= Number(amount);
        await fromAcc.save();
      }
      // Add to receiver
      const toAcc = await Account.findOne({ userId: req.user.id, name: toAccount });
      if (toAcc) {
        toAcc.balance += Number(amount);
        await toAcc.save();
      }
    } else {
      await updateAccountBalance(req.user.id, account, Number(amount), type, 'apply');
    }

    res.status(201).json(savedTransaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTransaction = async (req, res) => {
  const { id } = req.params;
  const { title, amount, type, category, account, toAccount, note, date, tags, receipt } = req.body;

  try {
    const oldTx = await Transaction.findOne({ _id: id, userId: req.user.id });
    if (!oldTx) return res.status(404).json({ message: 'Transaction not found' });

    const merged = {
      title: title || oldTx.title,
      amount: amount !== undefined ? Number(amount) : oldTx.amount,
      type: type || oldTx.type,
      category: category || oldTx.category,
      account: account || oldTx.account,
      toAccount: toAccount !== undefined ? toAccount : oldTx.toAccount,
    };
    const validationError = validateTransaction(merged);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    // 1. Reverse old transaction effect on balances
    if (oldTx.type === 'transfer') {
      const oldFromAcc = await Account.findOne({ userId: req.user.id, name: oldTx.account });
      if (oldFromAcc) {
        oldFromAcc.balance += oldTx.amount;
        await oldFromAcc.save();
      }
      const oldToAcc = await Account.findOne({ userId: req.user.id, name: oldTx.toAccount });
      if (oldToAcc) {
        oldToAcc.balance -= oldTx.amount;
        await oldToAcc.save();
      }
    } else {
      await updateAccountBalance(req.user.id, oldTx.account, oldTx.amount, oldTx.type, 'reverse');
    }

    // 2. Update transaction details
    oldTx.title = title || oldTx.title;
    oldTx.amount = amount !== undefined ? Number(amount) : oldTx.amount;
    oldTx.type = type || oldTx.type;
    oldTx.category = category || oldTx.category;
    oldTx.account = account || oldTx.account;
    oldTx.toAccount = toAccount !== undefined ? toAccount : oldTx.toAccount;
    oldTx.note = note !== undefined ? note : oldTx.note;
    if (date) oldTx.date = new Date(date);
    if (tags) {
      oldTx.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
    }
    if (receipt !== undefined) {
      oldTx.receipt = receipt;
    }

    if (req.file) {
      const receiptUrl = await uploadToCloudinary(req.file.buffer, req.file.originalname);
      oldTx.receipt = receiptUrl;
    }

    const updatedTx = await oldTx.save();

    // 3. Apply new transaction effect on balances
    if (updatedTx.type === 'transfer') {
      const newFromAcc = await Account.findOne({ userId: req.user.id, name: updatedTx.account });
      if (newFromAcc) {
        newFromAcc.balance -= updatedTx.amount;
        await newFromAcc.save();
      }
      const newToAcc = await Account.findOne({ userId: req.user.id, name: updatedTx.toAccount });
      if (newToAcc) {
        newToAcc.balance += updatedTx.amount;
        await newToAcc.save();
      }
    } else {
      await updateAccountBalance(req.user.id, updatedTx.account, updatedTx.amount, updatedTx.type, 'apply');
    }

    res.json(updatedTx);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTransaction = async (req, res) => {
  const { id } = req.params;

  try {
    const tx = await Transaction.findOne({ _id: id, userId: req.user.id });
    if (!tx) return res.status(404).json({ message: 'Transaction not found' });

    // Reverse balance updates
    if (tx.type === 'transfer') {
      const fromAcc = await Account.findOne({ userId: req.user.id, name: tx.account });
      if (fromAcc) {
        fromAcc.balance += tx.amount;
        await fromAcc.save();
      }
      const toAcc = await Account.findOne({ userId: req.user.id, name: tx.toAccount });
      if (toAcc) {
        toAcc.balance -= tx.amount;
        await toAcc.save();
      }
    } else {
      await updateAccountBalance(req.user.id, tx.account, tx.amount, tx.type, 'reverse');
    }

    await Transaction.deleteOne({ _id: id });
    res.json({ message: 'Transaction deleted successfully', id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const duplicateTransaction = async (req, res) => {
  // ... (existing code)
};

export const extractReceiptData = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const extractedData = await extractDataFromImage(req.file.buffer);
    res.json(extractedData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
