import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as ratingController from '../controllers/ratingController';

const router = Router();

// All rating routes require authentication
router.use(authenticate);

// POST /api/ratings/product - Rate a product
router.post('/product', ratingController.rateProduct);

// POST /api/ratings/seller - Rate a seller
router.post('/seller', ratingController.rateSeller);

// GET /api/ratings/product/:productId - Get product ratings
router.get('/product/:productId', ratingController.getProductRatings);

// GET /api/ratings/seller/:sellerId - Get seller ratings
router.get('/seller/:sellerId', ratingController.getSellerRatings);

// ============================================
// Enhanced Feedback Routes
// ============================================

// POST /api/feedback - Create feedback with pros/cons
router.post('/feedback', ratingController.createFeedback);

// POST /api/feedback/:id/respond - Seller responds to feedback
router.post('/feedback/:id/respond', ratingController.respondToFeedback);

// POST /api/feedback/:id/vote - Mark feedback as helpful
router.post('/feedback/:id/vote', ratingController.voteFeedback);

// GET /api/feedback/seller/:sellerId - Get seller feedback with categories
router.get('/feedback/seller/:sellerId', ratingController.getSellerFeedback);

// GET /api/feedback/product/:productId - Get product feedback
router.get('/feedback/product/:productId', ratingController.getProductFeedback);

// GET /api/feedback/analytics/:sellerId - Feedback analytics
router.get('/feedback/analytics/:sellerId', ratingController.getFeedbackAnalytics);

export default router;
