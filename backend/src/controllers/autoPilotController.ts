import { Request, Response } from 'express';
import AutoPilotService from '../services/autoPilotService';

// Get AI Dashboard Overview
export const getAiDashboard = async (req: Request, res: Response) => {
 try {
  const storeId = req.params.storeId || (req as any).user?.storeId;

  if (!storeId) {
   return res.status(400).json({ error: 'Store ID is required' });
  }

  const dashboard = await AutoPilotService.getAiDashboard(storeId);
  res.json(dashboard);
 } catch (error) {
  console.error('Error getting AI dashboard:', error);
  res.status(500).json({ error: 'Failed to get AI dashboard' });
 }
};

// Get Smart Suggestions
export const getSmartSuggestions = async (req: Request, res: Response) => {
 try {
  const storeId = req.params.storeId || (req as any).user?.storeId;

  if (!storeId) {
   return res.status(400).json({ error: 'Store ID is required' });
  }

  const suggestions = await AutoPilotService.getSmartSuggestions(storeId);
  res.json({ suggestions });
 } catch (error) {
  console.error('Error getting smart suggestions:', error);
  res.status(500).json({ error: 'Failed to get suggestions' });
 }
};

// Get Predictive Insights
export const getPredictiveInsights = async (req: Request, res: Response) => {
 try {
  const storeId = req.params.storeId || (req as any).user?.storeId;

  if (!storeId) {
   return res.status(400).json({ error: 'Store ID is required' });
  }

  const insights = await AutoPilotService.getPredictiveInsights(storeId);
  res.json(insights);
 } catch (error) {
  console.error('Error getting predictive insights:', error);
  res.status(500).json({ error: 'Failed to get insights' });
 }
};

// Detect Anomalies
export const detectAnomalies = async (req: Request, res: Response) => {
 try {
  const storeId = req.params.storeId || (req as any).user?.storeId;

  if (!storeId) {
   return res.status(400).json({ error: 'Store ID is required' });
  }

  const anomalies = await AutoPilotService.detectAnomalies(storeId);
  res.json({ anomalies });
 } catch (error) {
  console.error('Error detecting anomalies:', error);
  res.status(500).json({ error: 'Failed to detect anomalies' });
 }
};

// Get Daily Briefing
export const getDailyBriefing = async (req: Request, res: Response) => {
 try {
  const storeId = req.params.storeId || (req as any).user?.storeId;

  if (!storeId) {
   return res.status(400).json({ error: 'Store ID is required' });
  }

  const briefing = await AutoPilotService.getDailyBriefing(storeId);
  res.json(briefing);
 } catch (error) {
  console.error('Error getting daily briefing:', error);
  res.status(500).json({ error: 'Failed to get briefing' });
 }
};

// Get Weekly Report
export const getWeeklyReport = async (req: Request, res: Response) => {
 try {
  const storeId = req.params.storeId || (req as any).user?.storeId;

  if (!storeId) {
   return res.status(400).json({ error: 'Store ID is required' });
  }

  const report = await AutoPilotService.getWeeklyReport(storeId);
  res.json(report);
 } catch (error) {
  console.error('Error getting weekly report:', error);
  res.status(500).json({ error: 'Failed to get report' });
 }
};

// Analyze Trends
export const analyzeTrends = async (req: Request, res: Response) => {
 try {
  const storeId = req.params.storeId || (req as any).user?.storeId;

  if (!storeId) {
   return res.status(400).json({ error: 'Store ID is required' });
  }

  const trends = await AutoPilotService.analyzeTrends(storeId);
  res.json(trends);
 } catch (error) {
  console.error('Error analyzing trends:', error);
  res.status(500).json({ error: 'Failed to analyze trends' });
 }
};

// Auto Manage Inventory
export const autoManageInventory = async (req: Request, res: Response) => {
 try {
  const storeId = req.params.storeId || (req as any).user?.storeId;

  if (!storeId) {
   return res.status(400).json({ error: 'Store ID is required' });
  }

  const result = await AutoPilotService.autoManageInventory(storeId);
  res.json(result);
 } catch (error) {
  console.error('Error managing inventory:', error);
  res.status(500).json({ error: 'Failed to manage inventory' });
 }
};

// Auto Optimize Pricing
export const autoOptimizePricing = async (req: Request, res: Response) => {
 try {
  const storeId = req.params.storeId || (req as any).user?.storeId;

  if (!storeId) {
   return res.status(400).json({ error: 'Store ID is required' });
  }

  const result = await AutoPilotService.autoOptimizePricing(storeId);
  res.json(result);
 } catch (error) {
  console.error('Error optimizing pricing:', error);
  res.status(500).json({ error: 'Failed to optimize pricing' });
 }
};

// Auto Email Campaign
export const autoEmailCampaign = async (req: Request, res: Response) => {
 try {
  const storeId = req.params.storeId || (req as any).user?.storeId;
  const { campaignType } = req.body;

  if (!storeId) {
   return res.status(400).json({ error: 'Store ID is required' });
  }

  const result = await AutoPilotService.autoEmailCampaign(storeId, campaignType || 'general');
  res.json(result);
 } catch (error) {
  console.error('Error creating email campaign:', error);
  res.status(500).json({ error: 'Failed to create campaign' });
 }
};

// Auto Respond to Customer
export const autoRespondToCustomer = async (req: Request, res: Response) => {
 try {
  const storeId = req.params.storeId || (req as any).user?.storeId;
  const { message } = req.body;

  if (!storeId) {
   return res.status(400).json({ error: 'Store ID is required' });
  }

  if (!message) {
   return res.status(400).json({ error: 'Message is required' });
  }

  const response = await AutoPilotService.autoRespondToCustomer(storeId, message);
  res.json({ response });
 } catch (error) {
  console.error('Error auto-responding to customer:', error);
  res.status(500).json({ error: 'Failed to respond' });
 }
};

// Process Natural Language Query
export const processNaturalLanguageQuery = async (req: Request, res: Response) => {
 try {
  const storeId = req.params.storeId || (req as any).user?.storeId;
  const { query } = req.body;

  if (!storeId) {
   return res.status(400).json({ error: 'Store ID is required' });
  }

  if (!query) {
   return res.status(400).json({ error: 'Query is required' });
  }

  const result = await AutoPilotService.processNaturalLanguageQuery(storeId, query);
  res.json(result);
 } catch (error) {
  console.error('Error processing query:', error);
  res.status(500).json({ error: 'Failed to process query' });
 }
};

// Get Auto Pilot Settings
export const getAutoPilotSettings = async (req: Request, res: Response) => {
 try {
  const storeId = req.params.storeId || (req as any).user?.storeId;

  if (!storeId) {
   return res.status(400).json({ error: 'Store ID is required' });
  }

  const settings = await AutoPilotService.getAutoPilotSettings(storeId);
  res.json({ settings });
 } catch (error) {
  console.error('Error getting settings:', error);
  res.status(500).json({ error: 'Failed to get settings' });
 }
};

// Update Auto Pilot Settings
export const updateAutoPilotSettings = async (req: Request, res: Response) => {
 try {
  const storeId = req.params.storeId || (req as any).user?.storeId;
  const settings = req.body;

  if (!storeId) {
   return res.status(400).json({ error: 'Store ID is required' });
  }

  const result = await AutoPilotService.updateAutoPilotSettings(storeId, settings);
  res.json(result);
 } catch (error) {
  console.error('Error updating settings:', error);
  res.status(500).json({ error: 'Failed to update settings' });
 }
};

// Platform Owner: Auto Vendor Approval
export const autoApproveVendor = async (req: Request, res: Response) => {
 try {
  const { vendorId } = req.params;

  if (!vendorId) {
   return res.status(400).json({ error: 'Vendor ID is required' });
  }

  const result = await AutoPilotService.autoApproveVendor(vendorId);
  res.json(result);
 } catch (error) {
  console.error('Error auto-approving vendor:', error);
  res.status(500).json({ error: 'Failed to approve vendor' });
 }
};

// Platform Owner: Detect Fraud
export const detectFraud = async (req: Request, res: Response) => {
 try {
  const { orderId } = req.params;

  if (!orderId) {
   return res.status(400).json({ error: 'Order ID is required' });
  }

  const result = await AutoPilotService.detectFraud(orderId);
  res.json(result);
 } catch (error) {
  console.error('Error detecting fraud:', error);
  res.status(500).json({ error: 'Failed to detect fraud' });
 }
};

// Platform Owner: Resolve Dispute
export const resolveDispute = async (req: Request, res: Response) => {
 try {
  const { disputeId } = req.params;

  if (!disputeId) {
   return res.status(400).json({ error: 'Dispute ID is required' });
  }

  const result = await AutoPilotService.resolveDispute(disputeId);
  res.json(result);
 } catch (error) {
  console.error('Error resolving dispute:', error);
  res.status(500).json({ error: 'Failed to resolve dispute' });
 }
};

// Platform Owner: Check Compliance
export const checkCompliance = async (req: Request, res: Response) => {
 try {
  const { storeId } = req.params;

  if (!storeId) {
   return res.status(400).json({ error: 'Store ID is required' });
  }

  const result = await AutoPilotService.checkCompliance(storeId);
  res.json(result);
 } catch (error) {
  console.error('Error checking compliance:', error);
  res.status(500).json({ error: 'Failed to check compliance' });
 }
};

// Check feature availability
export const checkFeatureAvailability = async (req: Request, res: Response) => {
 try {
  const storeId = req.params.storeId || (req as any).user?.storeId;
  const { feature } = req.query;

  if (!storeId) {
   return res.status(400).json({ error: 'Store ID is required' });
  }

  if (!feature) {
   return res.status(400).json({ error: 'Feature name is required' });
  }

  const enabled = await AutoPilotService.isFeatureEnabled(storeId, feature as string);
  res.json({ feature, enabled });
 } catch (error) {
  console.error('Error checking feature:', error);
  res.status(500).json({ error: 'Failed to check feature' });
 }
};
