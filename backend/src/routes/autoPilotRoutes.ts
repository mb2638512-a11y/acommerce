import { Router } from 'express';
import * as autoPilotController from '../controllers/autoPilotController';

const router = Router();

// Core Auto Pilot Routes
router.get('/dashboard/:storeId', autoPilotController.getAiDashboard);
router.get('/suggestions/:storeId', autoPilotController.getSmartSuggestions);
router.get('/insights/:storeId', autoPilotController.getPredictiveInsights);
router.get('/anomalies/:storeId', autoPilotController.detectAnomalies);
router.get('/briefing/:storeId', autoPilotController.getDailyBriefing);
router.get('/weekly-report/:storeId', autoPilotController.getWeeklyReport);
router.get('/trends/:storeId', autoPilotController.analyzeTrends);

// Automation Routes
router.post('/inventory/:storeId', autoPilotController.autoManageInventory);
router.post('/pricing/:storeId', autoPilotController.autoOptimizePricing);
router.post('/email-campaign/:storeId', autoPilotController.autoEmailCampaign);
router.post('/respond/:storeId', autoPilotController.autoRespondToCustomer);

// Natural Language Query
router.post('/query/:storeId', autoPilotController.processNaturalLanguageQuery);

// Settings Routes
router.get('/settings/:storeId', autoPilotController.getAutoPilotSettings);
router.put('/settings/:storeId', autoPilotController.updateAutoPilotSettings);

// Feature Check
router.get('/feature/:storeId', autoPilotController.checkFeatureAvailability);

// Platform Owner Routes (Admin level)
router.post('/vendor/approve/:vendorId', autoPilotController.autoApproveVendor);
router.get('/fraud/:orderId', autoPilotController.detectFraud);
router.post('/dispute/:disputeId/resolve', autoPilotController.resolveDispute);
router.get('/compliance/:storeId', autoPilotController.checkCompliance);

export default router;
