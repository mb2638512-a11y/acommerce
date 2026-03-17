import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as disputeController from '../controllers/disputeController';

const router = Router();

// All dispute routes require authentication
router.use(authenticate);

// POST /api/disputes - Open a new dispute
router.post('/', disputeController.createDispute);

// GET /api/disputes - Get all disputes (admin only)
router.get('/', disputeController.getAllDisputes);

// GET /api/disputes/:id - Get dispute details
router.get('/:id', disputeController.getDispute);

// PUT /api/disputes/:id/respond - Seller responds
router.put('/:id/respond', disputeController.respondToDispute);

// PUT /api/disputes/:id/resolve - Admin resolves
router.put('/:id/resolve', disputeController.resolveDispute);

// GET /api/disputes/seller/:sellerId - Seller's disputes
router.get('/seller/:sellerId', disputeController.getSellerDisputes);

// GET /api/disputes/buyer/:buyerId - Buyer's disputes
router.get('/buyer/:buyerId', disputeController.getBuyerDisputes);

export default router;
