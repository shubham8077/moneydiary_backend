import express from 'express';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  duplicateTransaction,
  extractReceiptData,
} from '../controllers/transactionController.js';
import { auth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.use(auth);

router.get('/', getTransactions);
router.post('/extract', upload.single('receipt'), extractReceiptData);
router.post('/', upload.single('receipt'), createTransaction);
router.put('/:id', upload.single('receipt'), updateTransaction);
router.delete('/:id', deleteTransaction);
router.post('/:id/duplicate', duplicateTransaction);

export default router;

