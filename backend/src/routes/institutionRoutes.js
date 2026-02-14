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

const router = express.Router();

router.use(protect);

router.route('/').get(getInstitutions).post(createInstitution);
router
  .route('/:id')
  .get(getInstitution)
  .put(updateInstitution)
  .delete(deleteInstitution);
router.patch('/:id/status', toggleInstitutionStatus);

export default router;
