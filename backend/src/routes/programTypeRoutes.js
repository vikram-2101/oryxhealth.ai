import express from 'express';
import {
  getProgramTypes,
  getProgramType,
  createProgramType,
  updateProgramType,
  deleteProgramType,
} from '../controllers/programTypeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(requireRole('super_admin', 'account'));

router.route('/')
  .get(getProgramTypes)
  .post(createProgramType);

router.route('/:id')
  .get(getProgramType)
  .put(updateProgramType)
  .delete(deleteProgramType);

export default router;
