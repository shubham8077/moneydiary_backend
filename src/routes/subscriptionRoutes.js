import express from 'express';
import {
  getSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription,
} from '../controllers/subscriptionController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.use(auth);

router.get('/', getSubscriptions);
router.post('/', createSubscription);
router.put('/:id', updateSubscription);
router.delete('/:id', deleteSubscription);

export default router;
