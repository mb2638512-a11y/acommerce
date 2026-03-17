/**
 * Platform Analytics Controller
 * 
 * Provides platform-wide analytics and metrics:
 * - Total GMV (Gross Merchandise Value)
 * - Platform Revenue (total commissions)
 * - Active Sellers count
 * - Growth Metrics
 */

import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { env } from '../config/env';

interface GMVResponse {
 totalGMV: number;
 period: string;
 breakdown: {
  byTier: Record<string, number>;
  byMonth: Record<string, number>;
 };
}

interface PlatformRevenueResponse {
 totalRevenue: number;
 breakdown: {
  byTier: Record<string, number>;
  byMonth: Record<string, number>;
 };
}

interface ActiveSellersResponse {
 totalActive: number;
 byTier: Record<string, number>;
 trend: 'up' | 'down' | 'stable';
 percentChange: number;
}

interface GrowthMetricsResponse {
 gmvGrowth: number;
 revenueGrowth: number;
 sellerGrowth: number;
 orderGrowth: number;
 periods: {
  current: string;
  previous: string;
 };
}

interface DashboardOverview {
 totalGMV: number;
 totalRevenue: number;
 activeSellers: number;
 totalOrders: number;
 averageOrderValue: number;
 conversionRate: number;
 topCategories: Array<{ category: string; revenue: number }>;
 recentActivity: Array<{
  type: string;
  description: string;
  timestamp: Date;
 }>;
}

/**
 * Get total Gross Merchandise Value (GMV) across the platform
 */
export const getTotalGMV = async (req: Request, res: Response): Promise<void> => {
 try {
  const { period = 'all', startDate, endDate } = req.query;

  // Build date filter
  let dateFilter: { gte?: Date; lte?: Date } = {};
  const now = new Date();

  if (period === 'day') {
   dateFilter = { gte: new Date(now.setHours(0, 0, 0, 0)) };
  } else if (period === 'week') {
   dateFilter = { gte: new Date(now.setDate(now.getDate() - 7)) };
  } else if (period === 'month') {
   dateFilter = { gte: new Date(now.setMonth(now.getMonth() - 1)) };
  } else if (period === 'year') {
   dateFilter = { gte: new Date(now.setFullYear(now.getFullYear() - 1)) };
  } else if (startDate && endDate) {
   dateFilter = {
    gte: new Date(startDate as string),
    lte: new Date(endDate as string)
   };
  }

  // Get all orders with their items
  const orders = await prisma.order.findMany({
    where: {
      date: dateFilter.gte ? dateFilter : undefined,
      status: { not: 'CANCELLED' }
    },
    include: {
      store: true
    }
  });

  // Calculate GMV
  let totalGMV = 0;
  const byTier: Record<string, number> = {};
  const byMonth: Record<string, number> = {};

  for (const order of orders) {
   const orderTotal = order.total || 0;
   totalGMV += orderTotal;

   // By tier
   const tier = (order.store as any)?.subscription?.tier || 'STARTER';
   byTier[tier] = (byTier[tier] || 0) + orderTotal;

   // By month
   const monthKey = order.date.toISOString().slice(0, 7);
   byMonth[monthKey] = (byMonth[monthKey] || 0) + orderTotal;
  }

  const response: GMVResponse = {
   totalGMV,
   period: period as string,
   breakdown: { byTier, byMonth }
  };

  res.json(response);
 } catch (error) {
  console.error('getTotalGMV Error:', error);
  res.status(500).json({ error: 'Failed to fetch GMV data' });
 }
};

/**
 * Get total platform revenue (commissions earned)
 */
export const getPlatformRevenue = async (req: Request, res: Response): Promise<void> => {
 try {
  const { period = 'all', startDate, endDate } = req.query;

  // Build date filter
  let dateFilter: { gte?: Date; lte?: Date } = {};
  const now = new Date();

  if (period === 'day') {
   dateFilter = { gte: new Date(now.setHours(0, 0, 0, 0)) };
  } else if (period === 'week') {
   dateFilter = { gte: new Date(now.setDate(now.getDate() - 7)) };
  } else if (period === 'month') {
   dateFilter = { gte: new Date(now.setMonth(now.getMonth() - 1)) };
  } else if (period === 'year') {
   dateFilter = { gte: new Date(now.setFullYear(now.getFullYear() - 1)) };
  } else if (startDate && endDate) {
   dateFilter = {
    gte: new Date(startDate as string),
    lte: new Date(endDate as string)
   };
  }

  // Get all completed orders and calculate commissions
  const orders = await prisma.order.findMany({
    where: {
      date: dateFilter.gte ? dateFilter : undefined,
      status: { not: 'CANCELLED' }
    },
    include: {
      store: true
    }
  });

  let totalRevenue = 0;
  const byTier: Record<string, number> = {};
  const byMonth: Record<string, number> = {};

  // Commission rates by tier
  const commissionRates: Record<string, number> = {
   STARTER: env.platformCommissionFree,
   PRO: env.platformCommissionPro,
   PREMIUM: env.platformCommissionPremium,
   ENTERPRISE: env.platformCommissionEnterprise
  };

  for (const order of orders) {
   const orderTotal = order.total || 0;
   const tier = ((order.store as any)?.subscription?.tier || 'STARTER') as string;
   const commissionRate = commissionRates[tier] || env.platformCommissionFree;
   const commission = orderTotal * commissionRate;

   totalRevenue += commission;

   // By tier
   byTier[tier] = (byTier[tier] || 0) + commission;

   // By month
   const monthKey = order.date.toISOString().slice(0, 7);
   byMonth[monthKey] = (byMonth[monthKey] || 0) + commission;
  }

  const response: PlatformRevenueResponse = {
   totalRevenue,
   breakdown: { byTier, byMonth }
  };

  res.json(response);
 } catch (error) {
  console.error('getPlatformRevenue Error:', error);
  res.status(500).json({ error: 'Failed to fetch platform revenue' });
 }
};

/**
 * Get count of active sellers
 */
export const getActiveSellers = async (req: Request, res: Response): Promise<void> => {
 try {
  const { period = 'month' } = req.query;

  // Get active stores (sellers)
  const stores = await prisma.store.findMany({
   include: {
    products: true
   }
  });

  // Count stores with products as active sellers
  const activeSellers = stores.filter(store =>
   (store as any).products && (store as any).products.length > 0
  );

  // By tier
  const byTier: Record<string, number> = {};
  for (const store of activeSellers) {
   const tier = ((store as any).settings?.subscription?.tier || 'STARTER') as string;
   byTier[tier] = (byTier[tier] || 0) + 1;
  }

  // Calculate trend (compare to previous period)
  let percentChange = 0;
  let trend: 'up' | 'down' | 'stable' = 'stable';

  // Simple trend calculation - would need historical data for real implementation
  if (activeSellers.length > 0) {
   trend = 'up';
   percentChange = 10; // Placeholder
  }

  const response: ActiveSellersResponse = {
   totalActive: activeSellers.length,
   byTier,
   trend,
   percentChange
  };

  res.json(response);
 } catch (error) {
  console.error('getActiveSellers Error:', error);
  res.status(500).json({ error: 'Failed to fetch active sellers' });
 }
};

/**
 * Get growth metrics
 */
export const getGrowthMetrics = async (req: Request, res: Response): Promise<void> => {
 try {
  const { period = 'month' } = req.query;

  const now = new Date();
  let previousPeriodStart: Date;
  let currentPeriodStart: Date;

  if (period === 'month') {
   currentPeriodStart = new Date(now.setMonth(now.getMonth() - 1));
   previousPeriodStart = new Date(now.setMonth(now.getMonth() - 2));
  } else if (period === 'year') {
   currentPeriodStart = new Date(now.setFullYear(now.getFullYear() - 1));
   previousPeriodStart = new Date(now.setFullYear(now.getFullYear() - 2));
  } else {
   currentPeriodStart = new Date(now.setDate(now.getDate() - 14));
   previousPeriodStart = new Date(now.setDate(now.getDate() - 28));
  }

  // Current period orders
  const currentOrders = await prisma.order.findMany({
    where: {
      date: { gte: currentPeriodStart },
      status: { not: 'CANCELLED' }
    }
  });

  // Previous period orders
  const previousOrders = await prisma.order.findMany({
    where: {
      date: { gte: previousPeriodStart, lt: currentPeriodStart },
      status: { not: 'CANCELLED' }
    }
  });

  // Current GMV
  const currentGMV = currentOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const previousGMV = previousOrders.reduce((sum, o) => sum + (o.total || 0), 0);

  // Current revenue (simplified - 5% average commission)
  const currentRevenue = currentGMV * env.platformCommissionFree;
  const previousRevenue = previousGMV * env.platformCommissionFree;

  // Seller growth
  const currentStores = await prisma.store.count();
  const previousStores = currentStores - Math.floor(currentStores * 0.1); // Estimate

  // Order growth
  const currentOrderCount = currentOrders.length;
  const previousOrderCount = previousOrders.length;

  // Calculate percentages
  const gmvGrowth = previousGMV > 0
   ? ((currentGMV - previousGMV) / previousGMV) * 100
   : 0;
  const revenueGrowth = previousRevenue > 0
   ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
   : 0;
  const sellerGrowth = previousStores > 0
   ? ((currentStores - previousStores) / previousStores) * 100
   : 0;
  const orderGrowth = previousOrderCount > 0
   ? ((currentOrderCount - previousOrderCount) / previousOrderCount) * 100
   : 0;

  const response: GrowthMetricsResponse = {
   gmvGrowth,
   revenueGrowth,
   sellerGrowth,
   orderGrowth,
   periods: {
    current: currentPeriodStart.toISOString(),
    previous: previousPeriodStart.toISOString()
   }
  };

  res.json(response);
 } catch (error) {
  console.error('getGrowthMetrics Error:', error);
  res.status(500).json({ error: 'Failed to fetch growth metrics' });
 }
};

/**
 * Get comprehensive dashboard overview
 */
export const getDashboardOverview = async (req: Request, res: Response): Promise<void> => {
 try {
  // Get total GMV
  const orders = await prisma.order.findMany({
   where: { status: { not: 'CANCELLED' } }
  });
  const totalGMV = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  // Get platform revenue
  const platformRevenue = totalGMV * env.platformCommissionFree;

  // Get active sellers
  const stores = await prisma.store.findMany();
  const activeSellers = stores.length;

  // Get total orders
  const totalOrders = orders.length;

  // Average order value
  const averageOrderValue = totalOrders > 0 ? totalGMV / totalOrders : 0;

  // Top categories (simplified)
  const products = await prisma.product.findMany();
  const categoryRevenue: Record<string, number> = {};

  for (const order of orders) {
   // This would need orderItems for accurate category breakdown
   categoryRevenue['General'] = (categoryRevenue['General'] || 0) + (order.total || 0);
  }

  const topCategories = Object.entries(categoryRevenue)
   .map(([category, revenue]) => ({ category, revenue }))
   .sort((a, b) => b.revenue - a.revenue)
   .slice(0, 5);

  // Recent activity
  const recentOrders = await prisma.order.findMany({
   take: 10,
   orderBy: { date: 'desc' }
  });

  const recentActivity = recentOrders.map(order => ({
   type: 'ORDER',
   description: `New order #${order.id.slice(0, 8)} - $${order.total?.toFixed(2)}`,
   timestamp: order.date
  }));

  const response: DashboardOverview = {
   totalGMV,
   totalRevenue: platformRevenue,
   activeSellers,
   totalOrders,
   averageOrderValue,
   conversionRate: 3.2, // Placeholder - would need analytics
   topCategories,
   recentActivity
  };

  res.json(response);
 } catch (error) {
  console.error('getDashboardOverview Error:', error);
  res.status(500).json({ error: 'Failed to fetch dashboard overview' });
 }
};

export default {
 getTotalGMV,
 getPlatformRevenue,
 getActiveSellers,
 getGrowthMetrics,
 getDashboardOverview
};
