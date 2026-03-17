import express from 'express';
import {
  checkProduct,
  checkBulkProducts,
  getModerationFlags,
  getModerationStats,
  approveFlaggedProduct,
  rejectFlaggedProduct,
  getModerationLogs,
} from '../controllers/moderationController';
import { authenticate, authorize } from '../middleware/auth';
import { requireSecretAdminEmail } from '../middleware/adminAccess';

const router = express.Router();

// Public route - check a single product (for pre-creation validation)
router.post('/product', checkProduct);

// Protected route - check multiple products
router.post('/bulk', authenticate, checkBulkProducts);

// Admin routes - all require authentication, authorization, and secret email
router.use(authenticate);
router.use((req, res, next) => authorize(['admin'])(req, res, next));
router.use(requireSecretAdminEmail);

// Get flagged products
router.get('/flags', getModerationFlags);

// Get moderation statistics
router.get('/stats', getModerationStats);

// Get moderation logs
router.get('/logs', getModerationLogs);

// Approve flagged product
router.put('/approve/:id', approveFlaggedProduct);

// Reject flagged product
router.put('/reject/:id', rejectFlaggedProduct);

export default router;
