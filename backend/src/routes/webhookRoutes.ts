import express from 'express';
import { stripeWebhook } from '../controllers/webhookController';

const router = express.Router();

// Stripe needs the raw body to verify the signature
router.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhook);

export default router;
