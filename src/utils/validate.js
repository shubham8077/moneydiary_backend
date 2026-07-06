const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (email) =>
  typeof email === 'string' && email.trim().length > 0 && EMAIL_RE.test(email.trim());

export const isValidPassword = (password) =>
  typeof password === 'string' && password.length >= 6;

export const isValidName = (name) =>
  typeof name === 'string' && name.trim().length >= 2;

export const isPositiveNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0;
};

export const isNonNegativeNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0;
};

export const validateRegister = ({ name, email, password }) => {
  if (!isValidName(name)) {
    return 'Name must be at least 2 characters';
  }
  if (!isValidEmail(email)) {
    return 'A valid email address is required';
  }
  if (!isValidPassword(password)) {
    return 'Password must be at least 6 characters';
  }
  return null;
};

export const validateLogin = ({ email, password }) => {
  if (!isValidEmail(email)) {
    return 'A valid email address is required';
  }
  if (!isValidPassword(password)) {
    return 'Password must be at least 6 characters';
  }
  return null;
};

export const validateProfileUpdate = ({ name, theme, savingsGoal, monthlyBudget }) => {
  if (name !== undefined && !isValidName(name)) {
    return 'Name must be at least 2 characters';
  }
  if (theme !== undefined && !['light', 'dark'].includes(theme)) {
    return 'Theme must be light or dark';
  }
  if (savingsGoal !== undefined && !isNonNegativeNumber(savingsGoal)) {
    return 'Savings goal must be a non-negative number';
  }
  if (monthlyBudget !== undefined && !isNonNegativeNumber(monthlyBudget)) {
    return 'Monthly budget must be a non-negative number';
  }
  return null;
};

export const validateTransaction = ({ title, amount, type, category, account, toAccount }) => {
  if (!title || typeof title !== 'string' || !title.trim()) {
    return 'Title is required';
  }
  if (!isPositiveNumber(amount)) {
    return 'Amount must be greater than 0';
  }
  if (!['income', 'expense', 'saving', 'transfer'].includes(type)) {
    return 'Invalid transaction type';
  }
  if (!category || typeof category !== 'string' || !category.trim()) {
    return 'Category is required';
  }
  if (!account || typeof account !== 'string' || !account.trim()) {
    return 'Account is required';
  }
  if (type === 'transfer') {
    if (!toAccount || typeof toAccount !== 'string' || !toAccount.trim()) {
      return 'Destination account is required for transfers';
    }
    if (account.trim() === toAccount.trim()) {
      return 'Source and destination accounts must be different';
    }
  }
  return null;
};

export const validateTransfer = ({ fromAccountName, toAccountName, amount }) => {
  if (!fromAccountName || !toAccountName) {
    return 'Both accounts are required';
  }
  if (fromAccountName.trim() === toAccountName.trim()) {
    return 'Source and destination accounts must be different';
  }
  if (!isPositiveNumber(amount)) {
    return 'Amount must be greater than 0';
  }
  return null;
};

export const validateAccount = ({ name, type, icon }) => {
  if (!name || typeof name !== 'string' || !name.trim()) {
    return 'Account name is required';
  }
  if (name.trim().length > 50) {
    return 'Account name must be 50 characters or less';
  }
  if (!type || typeof type !== 'string') {
    return 'Account type is required';
  }
  if (!icon || typeof icon !== 'string') {
    return 'Account icon is required';
  }
  return null;
};

export const validateGoal = ({ title, targetAmount, targetDate, color, icon }) => {
  if (!title || typeof title !== 'string' || !title.trim()) {
    return 'Goal title is required';
  }
  if (!isPositiveNumber(targetAmount)) {
    return 'Target amount must be greater than 0';
  }
  if (!targetDate || Number.isNaN(new Date(targetDate).getTime())) {
    return 'A valid target date is required';
  }
  if (!color || !icon) {
    return 'Color and icon are required';
  }
  return null;
};

export const validateBudget = ({ category, limit }) => {
  if (!category || typeof category !== 'string' || !category.trim()) {
    return 'Category is required';
  }
  if (!isPositiveNumber(limit)) {
    return 'Budget limit must be greater than 0';
  }
  return null;
};

export const validateSubscription = ({ title, amount, renewalDate }) => {
  if (!title || typeof title !== 'string' || !title.trim()) {
    return 'Subscription title is required';
  }
  if (!isPositiveNumber(amount)) {
    return 'Amount must be greater than 0';
  }
  if (!renewalDate || Number.isNaN(new Date(renewalDate).getTime())) {
    return 'A valid renewal date is required';
  }
  return null;
};

export const validateReminder = ({ title, date }) => {
  if (!title || typeof title !== 'string' || !title.trim()) {
    return 'Reminder title is required';
  }
  if (!date || Number.isNaN(new Date(date).getTime())) {
    return 'A valid date is required';
  }
  return null;
};

export const validateContribution = ({ amount, accountName }) => {
  if (!isPositiveNumber(amount)) {
    return 'Amount must be greater than 0';
  }
  if (!accountName || typeof accountName !== 'string' || !accountName.trim()) {
    return 'Account is required';
  }
  return null;
};
