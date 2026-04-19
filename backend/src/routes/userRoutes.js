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

import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getUsers)
  .post(upload.single('signatureImage'), createUser);

router.route('/:id')
  .get(getUser)
  .put(upload.single('signatureImage'), updateUser)
  .delete(deleteUser);
router.patch('/:id/status', toggleUserStatus);

export default router;
