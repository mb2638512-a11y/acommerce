import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as sellerController from '../controllers/sellerController';
import * as followerController from '../controllers/followerController';

const router = Router();

// All routes require authentication
router.use(authenticate);

// POST /api/seller/onboard - Start seller onboarding
router.post('/onboard', sellerController.onboardSeller);

// GET /api/seller/status - Get Connect account status
router.get('/status', sellerController.getSellerStatus);

// GET /api/seller/commissions - Get commission history
router.get('/commissions', sellerController.getCommissions);

// GET /api/seller/payouts - Get payout history
router.get('/payouts', sellerController.getPayouts);

// GET /api/seller/dashboard - Get dashboard summary
router.get('/dashboard', sellerController.getDashboardSummary);

// GET /api/seller/dashboard-link - Get Stripe dashboard login link
router.get('/dashboard-link', sellerController.getDashboardLink);

// PUT /api/seller/plan - Update seller plan tier
router.put('/plan', sellerController.updateSellerPlan);

// Enhanced onboarding with bank verification
// POST /api/seller/onboard/bank-verification - Start onboarding with bank verification
router.post('/onboard/bank-verification', sellerController.onboardWithBankVerification);

// GET /api/seller/onboarding-status - Get detailed onboarding status
router.get('/onboarding-status', sellerController.getOnboardingStatus);

// POST /api/seller/refresh-link - Refresh expired account link
router.post('/refresh-link', sellerController.refreshAccountLink);

// ==================== Follower System Routes ====================

// POST /api/seller/follow - Follow a seller/store
router.post('/follow', followerController.followSeller);

// POST /api/seller/unfollow - Unfollow a seller/store
router.post('/unfollow', followerController.unfollowSeller);

// GET /api/seller/following/:storeId - Check if user is following a store
router.get('/following/:storeId', followerController.checkFollowing);

// GET /api/seller/followers/count/:storeId - Get follower count for a store
router.get('/followers/count/:storeId', followerController.getFollowerCount);

// GET /api/seller/followers/:storeId - Get followers list for a store (owner only)
router.get('/followers/:storeId', followerController.getStoreFollowers);

// GET /api/seller/following - Get stores user is following
router.get('/following', followerController.getFollowingStores);

// GET /api/seller/analytics/followers/:storeId - Get follower analytics for seller's dashboard
router.get('/analytics/followers/:storeId', followerController.getFollowerAnalytics);

// GET /api/seller/tier/:storeId - Get seller tier information
router.get('/tier/:storeId', followerController.getSellerTier);

export default router;
