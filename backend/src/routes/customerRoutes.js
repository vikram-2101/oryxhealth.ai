import express from 'express';
import {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  toggleCustomerStatus,
} from '../controllers/customerController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/').get(getCustomers).post(createCustomer);
router
  .route('/:id')
  .get(getCustomer)
  .put(updateCustomer)
  .delete(deleteCustomer);
router.patch('/:id/status', toggleCustomerStatus);

export default router;
