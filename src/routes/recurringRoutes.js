import express from 'express';
import {
  getRecurringTransactions,
  createRecurringTransaction,
  updateRecurringTransaction,
  deleteRecurringTransaction,
} from '../controllers/recurringController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.use(auth);

router.get('/', getRecurringTransactions);
router.post('/', createRecurringTransaction);
router.put('/:id', updateRecurringTransaction);
router.delete('/:id', deleteRecurringTransaction);

export default router;
