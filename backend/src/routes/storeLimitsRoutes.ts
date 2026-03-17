/**
 * Store Limits Routes
 * 
 * Provides endpoints for store limit management:
 * - GET /limits - Get current limits and usage
 * - GET /limits/product - Check product limit
 * - GET /limits/store - Check store limit
 */

import { Router } from 'express';
import * as storeLimitsController from '../controllers/storeLimitsController';

const router = Router();

// Get store limits
router.get('/limits', storeLimitsController.getStoreLimits);

// Check product limit
router.get('/limits/product', storeLimitsController.checkProductLimit);

// Check store limit
router.get('/limits/store', storeLimitsController.checkStoreLimit);

export default router;
