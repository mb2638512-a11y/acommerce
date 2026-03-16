import express from 'express';
import {
 getCategories,
 createCategory,
 updateCategory,
 deleteCategory
} from '../controllers/categoryController';
import { authenticate, authorize } from '../middleware/auth';
import { requireSecretAdminEmail } from '../middleware/adminAccess';

const router = express.Router();

// Publicly readable categories (e.g. for store categorization if needed)
router.get('/', getCategories);

// Admin only actions
router.post('/', authenticate, authorize(['admin']), requireSecretAdminEmail, createCategory);
router.put('/:id', authenticate, authorize(['admin']), requireSecretAdminEmail, updateCategory);
router.delete('/:id', authenticate, authorize(['admin']), requireSecretAdminEmail, deleteCategory);

export default router;
