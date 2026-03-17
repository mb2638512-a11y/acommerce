/**
 * Platform Analytics Routes
 * 
 * Provides platform-wide analytics endpoints:
 * - GET /gmv - Gross Merchandise Value
 * - GET /revenue - Platform revenue (commissions)
 * - GET /sellers - Active sellers count
 * - GET /growth - Growth metrics
 * - GET /dashboard - Dashboard overview
 */

import { Router } from 'express';
import * as platformAnalyticsController from '../controllers/platformAnalyticsController';

const router = Router();

// Get total GMV
router.get('/gmv', platformAnalyticsController.getTotalGMV);

// Get platform revenue
router.get('/revenue', platformAnalyticsController.getPlatformRevenue);

// Get active sellers
router.get('/sellers', platformAnalyticsController.getActiveSellers);

// Get growth metrics
router.get('/growth', platformAnalyticsController.getGrowthMetrics);

// Get dashboard overview
router.get('/dashboard', platformAnalyticsController.getDashboardOverview);

export default router;
