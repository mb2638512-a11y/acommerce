import express from 'express';
import { syncCart, getAbandonedCarts } from '../controllers/cartController';
import { authenticate, authenticateOptional } from '../middleware/auth';

const router = express.Router({ mergeParams: true });

router.post('/sync', authenticateOptional, syncCart);
router.get('/:storeId/abandoned', authenticate, getAbandonedCarts);
router.get('/abandoned', authenticate, getAbandonedCarts);

export default router;
