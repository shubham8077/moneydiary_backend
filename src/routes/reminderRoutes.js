import express from 'express';
import {
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder,
} from '../controllers/reminderController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.use(auth);

router.get('/', getReminders);
router.post('/', createReminder);
router.put('/:id', updateReminder);
router.delete('/:id', deleteReminder);

export default router;
