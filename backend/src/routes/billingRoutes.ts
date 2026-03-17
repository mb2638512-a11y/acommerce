import express from 'express';
import { authenticate } from '../middleware/auth';
import { getPlanCatalog, getStoreBilling, getStorePlanSummary, updateStorePlan, createCheckoutSession } from '../controllers/billingController';

const router = express.Router({ mergeParams: true });

router.get('/catalog', getPlanCatalog);
router.get('/summary', getStorePlanSummary);
router.use(authenticate);
router.get('/', getStoreBilling);
router.patch('/', updateStorePlan);
router.post('/checkout-session', createCheckoutSession);

export default router;
