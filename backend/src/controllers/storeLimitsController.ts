/**
 * Store Limits Controller
 * 
 * Provides endpoints for store limit enforcement:
 * - Get current limits and usage
 * - Check if actions are allowed
 */

import { Request, Response } from 'express';
import prisma from '../utils/prisma';

interface PlanLimits {
 maxProducts: number;
 maxStores: number;
 maxStorageMB: number;
 transactionFee: number;
 features: {
  customDomain: boolean;
  apiAccess: boolean;
  analytics: boolean;
  prioritySupport: boolean;
 };
}

const PLAN_LIMITS: Record<string, PlanLimits> = {
 STARTER: {
  maxProducts: 200,
  maxStores: 3,
  maxStorageMB: 500,
  transactionFee: 5,
  features: {
   customDomain: false,
   apiAccess: false,
   analytics: false,
   prioritySupport: false,
  },
 },
 PRO: {
  maxProducts: Infinity,
  maxStores: 10,
  maxStorageMB: 5000,
  transactionFee: 2,
  features: {
   customDomain: true,
   apiAccess: false,
   analytics: true,
   prioritySupport: false,
  },
 },
 PREMIUM: {
  maxProducts: Infinity,
  maxStores: 25,
  maxStorageMB: 25000,
  transactionFee: 1,
  features: {
   customDomain: true,
   apiAccess: true,
   analytics: true,
   prioritySupport: true,
  },
 },
 ENTERPRISE: {
  maxProducts: Infinity,
  maxStores: Infinity,
  maxStorageMB: Infinity,
  transactionFee: 0,
  features: {
   customDomain: true,
   apiAccess: true,
   analytics: true,
   prioritySupport: true,
  },
 },
};

// Helper to get user's plan tier
const getUserPlanTier = async (userId: string): Promise<string> => {
 const user = await prisma.user.findUnique({
  where: { id: userId },
 });

 if (!user) return 'STARTER';

 // Map user plan to store plan
 const planMap: Record<string, string> = {
  FREE: 'STARTER',
  PRO: 'PRO',
  PREMIUM: 'PREMIUM',
  ENTERPRISE: 'ENTERPRISE',
 };

 return planMap[(user as any).plan] || 'STARTER';
};

/**
 * Get store limits for current user
 */
export const getStoreLimits = async (req: Request, res: Response): Promise<void> => {
 try {
  // @ts-ignore - userId comes from auth middleware
  const userId = req.user?.id;

  if (!userId) {
   res.status(401).json({ error: 'Unauthorized' });
   return;
  }

  // Get user's plan
  const planTier = await getUserPlanTier(userId);
  const limits = PLAN_LIMITS[planTier] || PLAN_LIMITS.STARTER;

  // Count user's stores
  const storeCount = await prisma.store.count({
   where: { ownerId: userId },
  });

  // Count products across all stores
  const stores = await prisma.store.findMany({
   where: { ownerId: userId },
   include: { products: true },
  });

  const productCount = stores.reduce(
   (total, store) => total + ((store as any).products?.length || 0),
   0
  );

  // Calculate usage percentages
  const productUsage = limits.maxProducts === Infinity
   ? 0
   : (productCount / limits.maxProducts) * 100;
  const storeUsage = limits.maxStores === Infinity
   ? 0
   : (storeCount / limits.maxStores) * 100;

  // Determine if actions are allowed
  const canAddProduct = productCount < limits.maxProducts;
  const canAddStore = storeCount < limits.maxStores;

  // Determine upgrade requirement
  let upgradeRequired: string | undefined;
  if (!canAddProduct && planTier !== 'ENTERPRISE') {
   upgradeRequired = productCount >= PLAN_LIMITS.ENTERPRISE.maxProducts
    ? 'ENTERPRISE'
    : productCount >= PLAN_LIMITS.PREMIUM.maxProducts
     ? 'PREMIUM'
     : 'PRO';
  } else if (!canAddStore && planTier !== 'ENTERPRISE') {
   upgradeRequired = storeCount >= PLAN_LIMITS.ENTERPRISE.maxStores
    ? 'ENTERPRISE'
    : storeCount >= PLAN_LIMITS.PREMIUM.maxStores
     ? 'PREMIUM'
     : 'PRO';
  }

  res.json({
   currentProducts: productCount,
   currentStores: storeCount,
   currentStorageMB: 0, // Would need storage calculation
   plan: planTier,
   limits,
   canAddProduct,
   canAddStore,
   upgradeRequired,
   usagePercentage: {
    products: productUsage,
    stores: storeUsage,
    storage: 0,
   },
  });
 } catch (error) {
  console.error('getStoreLimits Error:', error);
  res.status(500).json({ error: 'Failed to fetch store limits' });
 }
};

/**
 * Check if user can add product
 */
export const checkProductLimit = async (req: Request, res: Response): Promise<void> => {
 try {
  // @ts-ignore
  const userId = req.user?.id;

  if (!userId) {
   res.status(401).json({ error: 'Unauthorized' });
   return;
  }

  const planTier = await getUserPlanTier(userId);
  const limits = PLAN_LIMITS[planTier] || PLAN_LIMITS.STARTER;

  // Count products
  const stores = await prisma.store.findMany({
   where: { ownerId: userId },
   include: { products: true },
  });

  const productCount = stores.reduce(
   (total, store) => total + ((store as any).products?.length || 0),
   0
  );

  const allowed = productCount < limits.maxProducts;

  res.json({
   allowed,
   current: productCount,
   limit: limits.maxProducts,
   plan: planTier,
   reason: allowed
    ? undefined
    : `Product limit reached (${productCount}/${limits.maxProducts})`,
  });
 } catch (error) {
  console.error('checkProductLimit Error:', error);
  res.status(500).json({ error: 'Failed to check product limit' });
 }
};

/**
 * Check if user can add store
 */
export const checkStoreLimit = async (req: Request, res: Response): Promise<void> => {
 try {
  // @ts-ignore
  const userId = req.user?.id;

  if (!userId) {
   res.status(401).json({ error: 'Unauthorized' });
   return;
  }

  const planTier = await getUserPlanTier(userId);
  const limits = PLAN_LIMITS[planTier] || PLAN_LIMITS.STARTER;

  // Count stores
  const storeCount = await prisma.store.count({
   where: { ownerId: userId },
  });

  const allowed = storeCount < limits.maxStores;

  res.json({
   allowed,
   current: storeCount,
   limit: limits.maxStores,
   plan: planTier,
   reason: allowed
    ? undefined
    : `Store limit reached (${storeCount}/${limits.maxStores})`,
  });
 } catch (error) {
  console.error('checkStoreLimit Error:', error);
  res.status(500).json({ error: 'Failed to check store limit' });
 }
};

export default {
 getStoreLimits,
 checkProductLimit,
 checkStoreLimit,
};
