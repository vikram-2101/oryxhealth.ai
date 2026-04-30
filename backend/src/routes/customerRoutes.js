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

// All customer routes are Super Admin only — Account/Institution admins
// cannot see or manage other customers.
router.use(protect, requireRole('super_admin'));

router.route('/').get(getCustomers).post(createCustomer);
router
  .route('/:id')
  .get(getCustomer)
  .put(updateCustomer)
  .delete(deleteCustomer);
router.patch('/:id/status', toggleCustomerStatus);
router.put('/:id/report-template', uploadReportTemplate);
router.get('/:id/report-template', getReportTemplate);

export default router;
