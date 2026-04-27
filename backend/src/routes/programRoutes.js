import express from 'express';
import {
  getPrograms,
  getProgram,
  createProgram,
  updateProgram,
  deleteProgram,
} from '../controllers/programController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(requireRole('super_admin', 'account'));

router.route('/')
  .get(getPrograms)
  .post(createProgram);

router.route('/:id')
  .get(getProgram)
  .put(updateProgram)
  .delete(deleteProgram);

export default router;
