/**
 * Store Limits Service for ACommerce Platform
 * 
 * Enforces tier-based limits for stores:
 * - FREE tier: 200 products, 3 stores
 * - PRO tier: Unlimited products, 10 stores
 * - PREMIUM tier: Unlimited products, 25 stores
 * - ENTERPRISE tier: Unlimited everything
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Plan limits configuration
export const PLAN_LIMITS = {
 STARTER: {
  maxProducts: 200,
  maxStores: 3,
  maxStorageMB: 500,
  transactionFee: 5, // 5%
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
  transactionFee: 2, // 2%
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
  transactionFee: 1, // 1%
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
  transactionFee: 0, // 0%
  features: {
   customDomain: true,
   apiAccess: true,
   analytics: true,
   prioritySupport: true,
  },
 },
};

export type PlanTier = keyof typeof PLAN_LIMITS;
export type PlanFeature = keyof typeof PLAN_LIMITS.STARTER.features;

export interface StoreLimitInfo {
 currentProducts: number;
 currentStores: number;
 currentStorageMB: number;
 plan: PlanTier;
 limits: typeof PLAN_LIMITS.STARTER;
 canAddProduct: boolean;
 canAddStore: boolean;
 upgradeRequired?: PlanTier;
 usagePercentage: {
  products: number;
  stores: number;
  storage: number;
 };
}

export interface UpgradePromptInfo {
 show: boolean;
 reason: string;
 currentLimit: number;
 requestedAmount: number;
 recommendedPlan: PlanTier;
 currentPlan: PlanTier;
}

// Helper to get auth token
const getAuthToken = (): string | null => {
 return localStorage.getItem('auth_token') || localStorage.getItem('token');
};

// API request helper
const fetchApi = async <T>(
 endpoint: string,
 options: RequestInit = {}
): Promise<T> => {
 const token = getAuthToken();

 const response = await fetch(`${API_BASE_URL}${endpoint}`, {
  ...options,
  headers: {
   'Content-Type': 'application/json',
   ...(token ? { Authorization: `Bearer ${token}` } : {}),
   ...options.headers,
  },
 });

 if (!response.ok) {
  const error = await response.json().catch(() => ({ error: 'Request failed' }));
  throw new Error(error.error || 'Request failed');
 }

 return response.json();
};

/**
 * Get current store's plan and limits
 */
export const getStoreLimits = async (): Promise<StoreLimitInfo> => {
 return fetchApi<StoreLimitInfo>('/stores/limits');
};

/**
 * Check if user can add a new product
 */
export const canAddProduct = async (): Promise<{
 allowed: boolean;
 reason?: string;
 upgradeTo?: PlanTier;
}> => {
 try {
  const limits = await getStoreLimits();
  return {
   allowed: limits.canAddProduct,
   reason: limits.canAddProduct ? undefined : `Product limit reached (${limits.currentProducts}/${limits.limits.maxProducts})`,
   upgradeTo: limits.upgradeRequired,
  };
 } catch (error) {
  console.error('Error checking product limit:', error);
  return { allowed: true }; // Default to allowed if error
 }
};

/**
 * Check if user can create a new store
 */
export const canAddStore = async (): Promise<{
 allowed: boolean;
 reason?: string;
 upgradeTo?: PlanTier;
}> => {
 try {
  const limits = await getStoreLimits();
  return {
   allowed: limits.canAddStore,
   reason: limits.canAddStore ? undefined : `Store limit reached (${limits.currentStores}/${limits.limits.maxStores})`,
   upgradeTo: limits.upgradeRequired,
  };
 } catch (error) {
  console.error('Error checking store limit:', error);
  return { allowed: true }; // Default to allowed if error
 }
};

/**
 * Get upgrade prompt information if needed
 */
export const getUpgradePrompt = async (type: 'product' | 'store'): Promise<UpgradePromptInfo> => {
 const limits = await getStoreLimits();

 if (type === 'product') {
  const currentUsage = limits.currentProducts;
  const limit = limits.limits.maxProducts;
  const recommendedPlan = getRecommendedPlan(currentUsage + 1, limits.currentStores);

  return {
   show: !limits.canAddProduct,
   reason: `You've reached your ${limits.plan} plan limit of ${limit} products`,
   currentLimit: limit,
   requestedAmount: currentUsage + 1,
   recommendedPlan,
   currentPlan: limits.plan,
  };
 } else {
  const currentUsage = limits.currentStores;
  const limit = limits.limits.maxStores;
  const recommendedPlan = getRecommendedPlan(limits.currentProducts, currentUsage + 1);

  return {
   show: !limits.canAddStore,
   reason: `You've reached your ${limits.plan} plan limit of ${limit} stores`,
   currentLimit: limit,
   requestedAmount: currentUsage + 1,
   recommendedPlan,
   currentPlan: limits.plan,
  };
 }
};

/**
 * Get recommended plan based on requirements
 */
export const getRecommendedPlan = (
 requiredProducts: number,
 requiredStores: number
): PlanTier => {
 if (requiredStores > 25 || requiredProducts === Infinity) {
  return 'ENTERPRISE';
 }
 if (requiredStores > 10 || requiredProducts > PLAN_LIMITS.PRO.maxProducts) {
  return 'PREMIUM';
 }
 if (requiredStores > 3 || requiredProducts > PLAN_LIMITS.STARTER.maxProducts) {
  return 'PRO';
 }
 return 'STARTER';
};

/**
 * Check if a feature is available on current plan
 */
export const hasFeature = async (feature: PlanFeature): Promise<boolean> => {
 try {
  const limits = await getStoreLimits();
  return limits.limits.features[feature];
 } catch (error) {
  console.error('Error checking feature:', error);
  return false;
 }
};

/**
 * Calculate usage percentage
 */
export const calculateUsagePercentage = (
 current: number,
 limit: number
): number => {
 if (limit === Infinity) return 0;
 return Math.min(100, (current / limit) * 100);
};

/**
 * Format limit display string
 */
export const formatLimit = (current: number, limit: number): string => {
 if (limit === Infinity) return `${current} / ∞`;
 return `${current} / ${limit}`;
};

/**
 * Get progress bar color based on usage
 */
export const getUsageColor = (percentage: number): string => {
 if (percentage >= 90) return 'red';
 if (percentage >= 75) return 'orange';
 if (percentage >= 50) return 'yellow';
 return 'green';
};

export default {
 PLAN_LIMITS,
 getStoreLimits,
 canAddProduct,
 canAddStore,
 getUpgradePrompt,
 getRecommendedPlan,
 hasFeature,
 calculateUsagePercentage,
 formatLimit,
 getUsageColor,
};
