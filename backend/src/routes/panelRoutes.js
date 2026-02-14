import express from 'express';
import {
  getPanels,
  getPanel,
  createPanel,
  updatePanel,
  deletePanel,
  togglePanelStatus,
} from '../controllers/panelController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/').get(getPanels).post(createPanel);
router.route('/:id').get(getPanel).put(updatePanel).delete(deletePanel);
router.patch('/:id/status', togglePanelStatus);

export default router;
