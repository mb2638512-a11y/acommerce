import express from 'express';
import { authenticate } from '../middleware/auth';
import {
 createPromoCode,
 getAllPromoCodes,
 getPromoCodeById,
 updatePromoCode,
 deletePromoCode,
 togglePromoCodeStatus,
 getPromoCodeStats,
 validatePromoCode
} from '../controllers/promoController';

const router = express.Router();

// Public endpoint - validate promo code
router.post('/validate', validatePromoCode);

// Admin routes - all require authentication
router.use(authenticate);
router.post('/', createPromoCode);
router.get('/', getAllPromoCodes);
router.get('/stats', getPromoCodeStats);
router.get('/:id', getPromoCodeById);
router.patch('/:id', updatePromoCode);
router.delete('/:id', deletePromoCode);
router.patch('/:id/toggle', togglePromoCodeStatus);

export default router;
