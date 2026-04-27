import express from 'express';
import {
  getInstitutions,
  getInstitution,
  createInstitution,
  updateInstitution,
  deleteInstitution,
  toggleInstitutionStatus,
} from '../controllers/institutionController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

// All three roles can read institutions (controllers will scope results)
router.get('/', requireRole('super_admin', 'account', 'institution'), getInstitutions);
router.get('/:id', requireRole('super_admin', 'account', 'institution'), getInstitution);

// Only super_admin and account admins can create/edit/delete institutions
router.post('/', requireRole('super_admin', 'account'), createInstitution);
router.put('/:id', requireRole('super_admin', 'account'), updateInstitution);
router.delete('/:id', requireRole('super_admin'), deleteInstitution);
router.patch('/:id/status', requireRole('super_admin', 'account'), toggleInstitutionStatus);

export default router;
