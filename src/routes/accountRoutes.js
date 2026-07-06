import express from 'express';
import {
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  transferMoney,
} from '../controllers/accountController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.use(auth);

router.get('/', getAccounts);
router.post('/', createAccount);
router.put('/:id', updateAccount);
router.delete('/:id', deleteAccount);
router.post('/transfer', transferMoney);

export default router;
