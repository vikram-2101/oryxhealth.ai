import express from 'express';
import {
  getProtocols,
  getProtocol,
  createProtocol,
  updateProtocol,
  deleteProtocol,
} from '../controllers/protocolController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(requireRole('super_admin', 'account'));

router.route('/')
  .get(getProtocols)
  .post(createProtocol);

router.route('/:id')
  .get(getProtocol)
  .put(updateProtocol)
  .delete(deleteProtocol);

export default router;
