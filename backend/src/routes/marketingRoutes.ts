import express from 'express';
import { getDiscounts, createDiscount, deleteDiscount, validateDiscount } from '../controllers/marketingController';
import { authenticate } from '../middleware/auth';
import { requireEmailMarketing, requireFlashSales, requirePushNotifications } from '../middleware/featureGate';

const router = express.Router({ mergeParams: true });

router.get('/validate', validateDiscount);
router.use(authenticate);

router.get('/', getDiscounts);
router.post('/', requireEmailMarketing, createDiscount);
router.delete('/:id', requireFlashSales, deleteDiscount);

export default router;
