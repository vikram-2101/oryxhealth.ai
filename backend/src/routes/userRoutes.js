import express from 'express';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/').get(getUsers).post(createUser);
router.route('/:id').get(getUser).put(updateUser).delete(deleteUser);
router.patch('/:id/status', toggleUserStatus);

export default router;
