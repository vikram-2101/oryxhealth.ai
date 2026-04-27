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
import { requireRole } from '../middleware/roleMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect);

// All three roles can read and create users (controllers will scope results)
router
  .route('/')
  .get(requireRole('super_admin', 'account', 'institution'), getUsers)
  .post(
    requireRole('super_admin', 'account', 'institution'),
    upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'signatureImage', maxCount: 1 }]),
    createUser
  );

router
  .route('/:id')
  .get(requireRole('super_admin', 'account', 'institution'), getUser)
  .put(
    requireRole('super_admin', 'account', 'institution'),
    upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'signatureImage', maxCount: 1 }]),
    updateUser
  )
  .delete(requireRole('super_admin', 'account'), deleteUser);

// Status toggle — account admins can manage their users' status
router.patch('/:id/status', requireRole('super_admin', 'account', 'institution'), toggleUserStatus);

export default router;
