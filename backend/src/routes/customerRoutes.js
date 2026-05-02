import express from 'express';
import {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  toggleCustomerStatus,
  uploadReportTemplate,
  getReportTemplate,
} from '../controllers/customerController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(requireRole('super_admin'), getCustomers)
  .post(requireRole('super_admin'), createCustomer);

router.route('/:id')
  .get(requireRole('super_admin', 'account'), getCustomer)
  .put(requireRole('super_admin', 'account'), updateCustomer)
  .delete(requireRole('super_admin'), deleteCustomer);

router.patch('/:id/status', requireRole('super_admin'), toggleCustomerStatus);
router.put('/:id/report-template', requireRole('super_admin', 'account'), uploadReportTemplate);
router.get('/:id/report-template', requireRole('super_admin', 'account', 'institution', 'doctor', 'health_worker', 'coordinator'), getReportTemplate);

export default router;
