import express from 'express';
import {
  getAppointmentTypes,
  createAppointmentType,
  updateAppointmentType,
  deleteAppointmentType,
} from '../controllers/appointmentTypeController.js';

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/').get(getAppointmentTypes).post(createAppointmentType);
router.route('/:id').put(updateAppointmentType).delete(deleteAppointmentType);

export default router;
