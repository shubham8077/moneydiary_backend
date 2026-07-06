import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import { validateAccount, validateTransfer, isNonNegativeNumber } from '../utils/validate.js';

const recalculateAccountBalances = async (userId) => {
  const accounts = await Account.find({ userId });
  const transactions = await Transaction.find({ userId }).sort({ date: 1, createdAt: 1 });

  const balances = Object.fromEntries(accounts.map((a) => [a.name, 0]));

  for (const tx of transactions) {
    const amount = Number(tx.amount);
    if (tx.type === 'transfer') {
      if (balances[tx.account] !== undefined) balances[tx.account] -= amount;
      if (tx.toAccount && balances[tx.toAccount] !== undefined) balances[tx.toAccount] += amount;
    } else if (tx.type === 'income') {
      if (balances[tx.account] !== undefined) balances[tx.account] += amount;
    } else if (tx.type === 'expense' || tx.type === 'saving') {
      if (balances[tx.account] !== undefined) balances[tx.account] -= amount;
    }
  }

  await Promise.all(
    accounts.map((acc) => {
      acc.balance = balances[acc.name] ?? 0;
      return acc.save();
    })
  );

  return accounts;
};

const defaultAccounts = [
  { name: 'Cash', type: 'Cash', balance: 0, icon: 'Wallet', currency: 'INR', excludeFromTotals: false, note: 'Physical Cash' },
  { name: 'Bank Account', type: 'Bank Account', balance: 0, icon: 'Landmark', currency: 'INR', excludeFromTotals: false, note: 'Primary Bank Account' },
  { name: 'Credit Card', type: 'Credit Card', balance: 0, icon: 'CreditCard', currency: 'INR', excludeFromTotals: false, note: 'Primary Credit Card' }
];

export const getAccounts = async (req, res) => {
  try {
    let accounts = await Account.find({ userId: req.user.id });

    // Seed defaults if user has no accounts
    if (accounts.length === 0) {
      console.log(`Seeding default accounts for user: ${req.user.id}`);
      await Account.insertMany(defaultAccounts.map(a => ({ ...a, userId: req.user.id })));
    }

    const syncedAccounts = await recalculateAccountBalances(req.user.id);
    res.json(syncedAccounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createAccount = async (req, res) => {
  const { name, type, currency, balance, icon, excludeFromTotals, note } = req.body;

  try {
    const validationError = validateAccount({ name, type, icon });
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }
    if (balance !== undefined && !isNonNegativeNumber(balance)) {
      return res.status(400).json({ message: 'Balance must be a non-negative number' });
    }

    // Check for duplicates
    const duplicate = await Account.findOne({ userId: req.user.id, name: name.trim() });
    if (duplicate) {
      return res.status(400).json({ message: 'Account with this name already exists' });
    }

    const newAccount = new Account({
      userId: req.user.id,
      name: name.trim(),
      type,
      currency: currency || 'INR',
      balance: balance !== undefined ? Number(balance) : 0,
      icon,
      excludeFromTotals: !!excludeFromTotals,
      note: note || '',
    });

    const savedAccount = await newAccount.save();
    res.status(201).json(savedAccount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAccount = async (req, res) => {
  const { id } = req.params;
  const { name, type, currency, balance, icon, excludeFromTotals, note } = req.body;

  try {
    const account = await Account.findOne({ _id: id, userId: req.user.id });
    if (!account) return res.status(404).json({ message: 'Account not found' });

    const validationError = validateAccount({
      name: name || account.name,
      type: type || account.type,
      icon: icon || account.icon,
    });
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }
    if (balance !== undefined && !isNonNegativeNumber(balance)) {
      return res.status(400).json({ message: 'Balance must be a non-negative number' });
    }

    account.name = name ? name.trim() : account.name;
    account.type = type || account.type;
    account.currency = currency || account.currency;
    if (balance !== undefined) account.balance = Number(balance);
    account.icon = icon || account.icon;
    if (excludeFromTotals !== undefined) account.excludeFromTotals = !!excludeFromTotals;
    if (note !== undefined) account.note = note;

    const updatedAccount = await account.save();
    res.json(updatedAccount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAccount = async (req, res) => {
  const { id } = req.params;

  try {
    const account = await Account.findOne({ _id: id, userId: req.user.id });
    if (!account) return res.status(404).json({ message: 'Account not found' });

    await Account.deleteOne({ _id: id });
    res.json({ message: 'Account deleted successfully', id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const transferMoney = async (req, res) => {
  const { fromAccountName, toAccountName, amount, note, date } = req.body;

  try {
    const validationError = validateTransfer({ fromAccountName, toAccountName, amount });
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const fromAcc = await Account.findOne({ userId: req.user.id, name: fromAccountName });
    const toAcc = await Account.findOne({ userId: req.user.id, name: toAccountName });

    if (!fromAcc || !toAcc) {
      return res.status(404).json({ message: 'One or both accounts were not found' });
    }

    // Perform Transfer
    fromAcc.balance -= Number(amount);
    toAcc.balance += Number(amount);

    await fromAcc.save();
    await toAcc.save();

    // Create a transaction record of type 'transfer'
    const Transaction = (await import('../models/Transaction.js')).default;
    const transferTx = new Transaction({
      userId: req.user.id,
      title: `Transfer from ${fromAccountName} to ${toAccountName}`,
      amount: Number(amount),
      type: 'transfer',
      category: 'Transfer',
      account: fromAccountName,
      toAccount: toAccountName,
      note: note || '',
      date: date ? new Date(date) : new Date(),
    });

    const savedTx = await transferTx.save();
    res.status(201).json({ savedTx, fromAcc, toAcc });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
