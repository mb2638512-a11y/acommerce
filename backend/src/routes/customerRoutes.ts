import express from 'express';
import { getStoreCustomers, getCustomerByEmail } from '../controllers/customerController';
import { authenticate } from '../middleware/auth';
import { requireMembershipTiers, requireAdvancedSegmentation } from '../middleware/featureGate';

const router = express.Router({ mergeParams: true });

// Protected: Store Admin
router.get('/', authenticate, getStoreCustomers);

router.get('/profile', authenticate, requireMembershipTiers, getCustomerByEmail);

export default router;
