import express from 'express';
import {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  contributeToGoal,
} from '../controllers/goalController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.use(auth);

router.get('/', getGoals);
router.post('/', createGoal);
router.put('/:id', updateGoal);
router.delete('/:id', deleteGoal);
router.post('/:id/contribute', contributeToGoal);

export default router;
