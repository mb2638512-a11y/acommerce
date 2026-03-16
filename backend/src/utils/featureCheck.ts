import { FeatureKey, FeatureFlags, getFeaturesForPlan, getFeatureForPlan, PLAN_TIERS, PlanTier } from '../config/platformPlans';
import { getStorePlanTier as getTierFromSettings, hasFeature, getStoreFeatures as getStoreFeaturesFromPlan } from '../utils/storePlan';
import prisma from './prisma';

/**
 * Check if a store can access a specific feature
 * @param storeId - The ID of the store
 * @param featureName - The name of the feature to check
 * @returns Promise<boolean> - true if the store has access to the feature
 */
export const canAccessFeature = async (storeId: string, featureName: FeatureKey): Promise<boolean> => {
 try {
  const store = await prisma.store.findUnique({
   where: { id: storeId },
   select: { settings: true }
  });

  if (!store) {
   return false;
  }

  return hasFeature(store.settings, featureName);
 } catch (error) {
  console.error('Error checking feature access:', error);
  return false;
 }
};

/**
 * Get all available features for a store
 * @param storeId - The ID of the store
 * @returns Promise<FeatureFlags> - All features available for the store's plan
 */
export const getStoreFeatures = async (storeId: string): Promise<FeatureFlags | null> => {
 try {
  const store = await prisma.store.findUnique({
   where: { id: storeId },
   select: { settings: true }
  });

  if (!store) {
   return null;
  }

  return getStoreFeaturesFromPlan(store.settings);
 } catch (error) {
  console.error('Error getting store features:', error);
  return null;
 }
};

/**
 * Get the store's current plan tier
 * @param storeId - The ID of the store
 * @returns Promise<PlanTier> - The store's current plan tier
 */
export const getStorePlanTierById = async (storeId: string): Promise<PlanTier> => {
 try {
  const store = await prisma.store.findUnique({
   where: { id: storeId },
   select: { settings: true }
  });

  if (!store) {
   return 'STARTER';
  }

  return getTierFromSettings(store.settings);
 } catch (error) {
  console.error('Error getting store plan tier:', error);
  return 'STARTER';
 }
};

/**
 * Get feature availability info for a store
 * @param storeId - The ID of the store
 * @param featureName - The name of the feature to check
 * @returns Promise containing detailed feature access info
 */
export const getFeatureAccessInfo = async (
 storeId: string,
 featureName: FeatureKey
): Promise<{
 hasAccess: boolean;
 currentPlan: PlanTier;
 requiredPlan: PlanTier | null;
 featureFlags: FeatureFlags | null;
}> => {
 try {
  const store = await prisma.store.findUnique({
   where: { id: storeId },
   select: { settings: true }
  });

  if (!store) {
   return {
    hasAccess: false,
    currentPlan: 'STARTER',
    requiredPlan: null,
    featureFlags: null
   };
  }

  const currentPlan = getTierFromSettings(store.settings);
  const hasAccess = hasFeature(store.settings, featureName);
  const featureFlags = getStoreFeaturesFromPlan(store.settings);

  // Find the minimum tier required for this feature
  let requiredPlan: PlanTier | null = null;
  for (const tier of PLAN_TIERS) {
   if (getFeatureForPlan(tier, featureName)) {
    requiredPlan = tier;
    break;
   }
  }

  return {
   hasAccess,
   currentPlan,
   requiredPlan,
   featureFlags
  };
 } catch (error) {
  console.error('Error getting feature access info:', error);
  return {
   hasAccess: false,
   currentPlan: 'STARTER',
   requiredPlan: null,
   featureFlags: null
  };
 }
};

/**
 * Check multiple features at once
 * @param storeId - The ID of the store
 * @param features - Array of feature names to check
 * @returns Promise<Map<FeatureKey, boolean>> - Map of feature names to access status
 */
export const checkMultipleFeatures = async (
 storeId: string,
 features: FeatureKey[]
): Promise<Map<FeatureKey, boolean>> => {
 const result = new Map<FeatureKey, boolean>();

 try {
  const store = await prisma.store.findUnique({
   where: { id: storeId },
   select: { settings: true }
  });

  if (!store) {
   features.forEach(f => result.set(f, false));
   return result;
  }

  for (const feature of features) {
   result.set(feature, hasFeature(store.settings, feature));
  }

  return result;
 } catch (error) {
  console.error('Error checking multiple features:', error);
  features.forEach(f => result.set(f, false));
  return result;
 }
};

/**
 * Get list of features available in a specific plan tier
 * @param tier - The plan tier
 * @returns FeatureFlags - Features available in the tier
 */
export const getFeaturesByTier = (tier: PlanTier): FeatureFlags => {
 return getFeaturesForPlan(tier);
};

/**
 * Get the minimum plan tier required for a feature
 * @param featureName - The name of the feature
 * @returns PlanTier - The minimum plan tier required
 */
export const getRequiredPlanForFeature = (featureName: FeatureKey): PlanTier => {
 for (const tier of PLAN_TIERS) {
  if (getFeatureForPlan(tier, featureName)) {
   return tier;
  }
 }
 return 'ENTERPRISE';
};

/**
 * Get all premium features that are NOT available for a store
 * @param storeId - The ID of the store
 * @returns Promise<FeatureKey[]> - List of unavailable features
 */
export const getUnavailableFeatures = async (storeId: string): Promise<FeatureKey[]> => {
 const unavailable: FeatureKey[] = [];

 const allFeatures: FeatureKey[] = [
  // Marketing & Sales
  'bulkProductImport', 'emailMarketing', 'facebookPixel', 'googleAnalytics',
  'discountAutomation', 'loyaltyProgram', 'flashSales', 'pushNotifications',

  // Store Management
  'multiLanguage', 'posIntegration', 'inventoryAlerts', 'productVariants',
  'bundleProducts', 'seasonalThemes',

  // Advanced Commerce
  'membershipTiers', 'giftCards', 'bookingSystem', 'waitlist', 'preOrders', 'wholesalePricing',

  // Support & Branding
  'whiteLabelBranding', 'apiAccess', 'customReports', 'advancedSegmentation', 'auditLogs',

  // NEW AI Features
  'aiDemandForecasting', 'aiCustomerLifetimeValue', 'aiPriceElasticity', 'aiMarketBasketAnalysis',
  'aiCustomerSegmentation', 'aiTrendPrediction', 'aiCompetitorAnalysis', 'aiPersonalizedRecommendations',
  'aiDynamicPricing', 'aiSearchOptimization', 'aiVisualSearch', 'aiVoiceSearch', 'aiChatbotAdvanced',
  'aiReviewSummarization', 'aiProductComparison', 'aiInventoryPrediction', 'aiFraudDetection',
  'aiShippingOptimization', 'aiReturnPrediction', 'aiQualityControl', 'aiSupplierManagement',
  'aiDemandPlanning', 'aiAutoCataloging',

  // NEW Premium Features
  'reTargetingAds', 'influencerMarketing', 'affiliateTracking', 'loyaltyPoints', 'rewardsProgram',
  'backOrders', 'groupBuying', 'dailyDeals', 'seasonalDiscounts', 'customerPortals', 'returnPortal',
  'giftRegistries', 'storeCredit', 'priceMatch', 'priceAlert',

  // Platform Owner / Global Admin Dashboard Features (200 features)
  'platformName', 'platformLogo', 'platformTheme', 'platformCurrency', 'platformLanguage',
  'timezone', 'dateFormat', 'emailSettings', 'smtpSettings', 'emailTemplates',
  'pushSettings', 'smsSettings', 'notificationSettings', 'maintenanceMode', 'platformStatus',
  'platformVersion', 'platformUpdates', 'backupSettings', 'platformAnalytics', 'trafficAnalytics',
  'userAnalytics', 'salesAnalytics', 'apiUsage', 'storageUsage', 'bandwidthUsage',
  'platformHealth', 'serverStatus', 'databaseStatus', 'cacheStatus', 'queueStatus',
  'schedulerStatus', 'platformLogs', 'errorLogs', 'accessLogs', 'auditLogsPlatform',
  'platformSecurity', 'platformCompliance', 'dataRetention', 'privacyPolicyPlatform', 'termsOfService',
  'cookiePolicy', 'vendorApproval', 'vendorVerification', 'vendorKyc', 'vendorContracts',
  'vendorOnboarding', 'vendorTraining', 'vendorSupport', 'vendorCommunication', 'vendorPerformance',
  'vendorRating', 'vendorReviews', 'vendorDisputes', 'vendorPayments', 'vendorPayouts',
  'vendorCommissions', 'vendorFees', 'vendorBilling', 'vendorInvoices', 'vendorReports',
  'vendorAnalytics', 'vendorDashboard', 'vendorPortal', 'vendorApi', 'vendorWebhooks',
  'vendorIntegrations', 'vendorPlugins', 'vendorThemes', 'vendorBranding', 'vendorCustomDomain',
  'vendorSsl', 'vendorEmail', 'vendorSupportPortal', 'vendorTemplates', 'vendorMarketplace',
  'vendorSeo', 'vendorAnalyticsDashboard', 'vendorTraffic', 'vendorConversions', 'vendorRevenue',
  'commissionStructure', 'commissionTiers', 'commissionRules', 'commissionCalculation', 'commissionPayout',
  'commissionHold', 'commissionTax', 'commissionReporting', 'platformRevenue', 'revenueShare',
  'platformRevenueReports', 'billingCycle', 'invoiceGenerationPlatform', 'paymentProcessing', 'refundProcessing',
  'chargebackHandling', 'disputeResolution', 'paymentGateway', 'paymentMethods', 'currencySupport',
  'multiCurrencyPayment', 'currencyConversion', 'forexRates', 'paymentSecurity', 'pciCompliance',
  'paymentAnalytics', 'transactionLogs', 'reconciliation', 'accounting', 'financialReportsPlatform',
  'multiVendor', 'vendorStores', 'vendorProducts', 'vendorOrders', 'marketplaceSearch',
  'marketplaceBrowse', 'categoryManagementPlatform', 'productCatalog', 'productApproval', 'productModeration',
  'inventoryManagement', 'stockManagementPlatform', 'orderManagement', 'fulfillment', 'shippingIntegration',
  'returnsManagement', 'exchangeManagement', 'refundManagement', 'warrantyManagement', 'productReviews',
  'reviewModeration', 'ratingsManagement', 'questionsAnswers', 'customerSupport', 'liveChat',
  'helpCenter', 'knowledgeBase', 'faqManagement', 'ticketSystem', 'escalation',
  'abuseManagement', 'counterfeitDetection', 'intellectualProperty', 'brandProtection', 'contentModeration',
  'searchOptimization', 'seoTools', 'marketingTools', 'advertising', 'realTimeAnalyticsPlatform',
  'salesAnalyticsPlatform', 'revenueAnalytics', 'trafficAnalyticsPlatform', 'conversionAnalytics', 'userBehaviorAnalytics',
  'vendorPerformanceMetrics', 'productPerformance', 'orderAnalytics', 'cartAnalytics', 'churnAnalytics',
  'retentionAnalytics', 'cohortAnalysisPlatform', 'predictiveAnalyticsPlatform', 'marketTrends', 'competitiveAnalysis',
  'customerInsights', 'segmentAnalysis', 'abTesting', 'funnelAnalysis', 'heatmapsPlatform',
  'dashboards', 'customReportsPlatform', 'scheduledReports', 'dataExport', 'biIntegration',
  'platformAuthentication', 'ssoIntegration', 'oauth', 'oauthProviderPlatform', 'ldapIntegrationPlatform',
  'activeDirectoryPlatform', 'twoFactorAuthPlatform', 'biometricAuth', 'passwordPolicy', 'sessionManagementPlatform',
  'ipWhitelist', 'geoBlocking', 'ddosProtectionPlatform', 'malwareProtection', 'vulnerabilityScanning',
  'penetrationTestingPlatform', 'securityAudits', 'complianceReporting', 'gdprCompliancePlatform', 'ccpaCompliance',
  'hipaaCompliancePlatform', 'pciDssCompliancePlatform', 'soc2CompliancePlatform', 'iso27001Compliance', 'dataEncryption'
 ];


 try {
  const store = await prisma.store.findUnique({
   where: { id: storeId },
   select: { settings: true }
  });

  if (!store) {
   return allFeatures;
  }

  for (const feature of allFeatures) {
   if (!hasFeature(store.settings, feature)) {
    unavailable.push(feature);
   }
  }

  return unavailable;
 } catch (error) {
  console.error('Error getting unavailable features:', error);
  return allFeatures;
 }
};

/**
 * Get all premium features that ARE available for a store
 * @param storeId - The ID of the store
 * @returns Promise<FeatureKey[]> - List of available features
 */
export const getAvailableFeatures = async (storeId: string): Promise<FeatureKey[]> => {
 const available: FeatureKey[] = [];

 const allFeatures: FeatureKey[] = [
  // Marketing & Sales
  'bulkProductImport', 'emailMarketing', 'facebookPixel', 'googleAnalytics',
  'discountAutomation', 'loyaltyProgram', 'flashSales', 'pushNotifications',

  // Store Management
  'multiLanguage', 'posIntegration', 'inventoryAlerts', 'productVariants',
  'bundleProducts', 'seasonalThemes',

  // Advanced Commerce
  'membershipTiers', 'giftCards', 'bookingSystem', 'waitlist', 'preOrders', 'wholesalePricing',

  // Support & Branding
  'whiteLabelBranding', 'apiAccess', 'customReports', 'advancedSegmentation', 'auditLogs',

  // NEW AI Features
  'aiDemandForecasting', 'aiCustomerLifetimeValue', 'aiPriceElasticity', 'aiMarketBasketAnalysis',
  'aiCustomerSegmentation', 'aiTrendPrediction', 'aiCompetitorAnalysis', 'aiPersonalizedRecommendations',
  'aiDynamicPricing', 'aiSearchOptimization', 'aiVisualSearch', 'aiVoiceSearch', 'aiChatbotAdvanced',
  'aiReviewSummarization', 'aiProductComparison', 'aiInventoryPrediction', 'aiFraudDetection',
  'aiShippingOptimization', 'aiReturnPrediction', 'aiQualityControl', 'aiSupplierManagement',
  'aiDemandPlanning', 'aiAutoCataloging',

  // NEW Premium Features
  'reTargetingAds', 'influencerMarketing', 'affiliateTracking', 'loyaltyPoints', 'rewardsProgram',
  'backOrders', 'groupBuying', 'dailyDeals', 'seasonalDiscounts', 'customerPortals', 'returnPortal',
  'giftRegistries', 'storeCredit', 'priceMatch', 'priceAlert',

  // Platform Owner / Global Admin Dashboard Features (200 features)
  'platformName', 'platformLogo', 'platformTheme', 'platformCurrency', 'platformLanguage',
  'timezone', 'dateFormat', 'emailSettings', 'smtpSettings', 'emailTemplates',
  'pushSettings', 'smsSettings', 'notificationSettings', 'maintenanceMode', 'platformStatus',
  'platformVersion', 'platformUpdates', 'backupSettings', 'platformAnalytics', 'trafficAnalytics',
  'userAnalytics', 'salesAnalytics', 'apiUsage', 'storageUsage', 'bandwidthUsage',
  'platformHealth', 'serverStatus', 'databaseStatus', 'cacheStatus', 'queueStatus',
  'schedulerStatus', 'platformLogs', 'errorLogs', 'accessLogs', 'auditLogsPlatform',
  'platformSecurity', 'platformCompliance', 'dataRetention', 'privacyPolicyPlatform', 'termsOfService',
  'cookiePolicy', 'vendorApproval', 'vendorVerification', 'vendorKyc', 'vendorContracts',
  'vendorOnboarding', 'vendorTraining', 'vendorSupport', 'vendorCommunication', 'vendorPerformance',
  'vendorRating', 'vendorReviews', 'vendorDisputes', 'vendorPayments', 'vendorPayouts',
  'vendorCommissions', 'vendorFees', 'vendorBilling', 'vendorInvoices', 'vendorReports',
  'vendorAnalytics', 'vendorDashboard', 'vendorPortal', 'vendorApi', 'vendorWebhooks',
  'vendorIntegrations', 'vendorPlugins', 'vendorThemes', 'vendorBranding', 'vendorCustomDomain',
  'vendorSsl', 'vendorEmail', 'vendorSupportPortal', 'vendorTemplates', 'vendorMarketplace',
  'vendorSeo', 'vendorAnalyticsDashboard', 'vendorTraffic', 'vendorConversions', 'vendorRevenue',
  'commissionStructure', 'commissionTiers', 'commissionRules', 'commissionCalculation', 'commissionPayout',
  'commissionHold', 'commissionTax', 'commissionReporting', 'platformRevenue', 'revenueShare',
  'platformRevenueReports', 'billingCycle', 'invoiceGenerationPlatform', 'paymentProcessing', 'refundProcessing',
  'chargebackHandling', 'disputeResolution', 'paymentGateway', 'paymentMethods', 'currencySupport',
  'multiCurrencyPayment', 'currencyConversion', 'forexRates', 'paymentSecurity', 'pciCompliance',
  'paymentAnalytics', 'transactionLogs', 'reconciliation', 'accounting', 'financialReportsPlatform',
  'multiVendor', 'vendorStores', 'vendorProducts', 'vendorOrders', 'marketplaceSearch',
  'marketplaceBrowse', 'categoryManagementPlatform', 'productCatalog', 'productApproval', 'productModeration',
  'inventoryManagement', 'stockManagementPlatform', 'orderManagement', 'fulfillment', 'shippingIntegration',
  'returnsManagement', 'exchangeManagement', 'refundManagement', 'warrantyManagement', 'productReviews',
  'reviewModeration', 'ratingsManagement', 'questionsAnswers', 'customerSupport', 'liveChat',
  'helpCenter', 'knowledgeBase', 'faqManagement', 'ticketSystem', 'escalation',
  'abuseManagement', 'counterfeitDetection', 'intellectualProperty', 'brandProtection', 'contentModeration',
  'searchOptimization', 'seoTools', 'marketingTools', 'advertising', 'realTimeAnalyticsPlatform',
  'salesAnalyticsPlatform', 'revenueAnalytics', 'trafficAnalyticsPlatform', 'conversionAnalytics', 'userBehaviorAnalytics',
  'vendorPerformanceMetrics', 'productPerformance', 'orderAnalytics', 'cartAnalytics', 'churnAnalytics',
  'retentionAnalytics', 'cohortAnalysisPlatform', 'predictiveAnalyticsPlatform', 'marketTrends', 'competitiveAnalysis',
  'customerInsights', 'segmentAnalysis', 'abTesting', 'funnelAnalysis', 'heatmapsPlatform',
  'dashboards', 'customReportsPlatform', 'scheduledReports', 'dataExport', 'biIntegration',
  'platformAuthentication', 'ssoIntegration', 'oauth', 'oauthProviderPlatform', 'ldapIntegrationPlatform',
  'activeDirectoryPlatform', 'twoFactorAuthPlatform', 'biometricAuth', 'passwordPolicy', 'sessionManagementPlatform',
  'ipWhitelist', 'geoBlocking', 'ddosProtectionPlatform', 'malwareProtection', 'vulnerabilityScanning',
  'penetrationTestingPlatform', 'securityAudits', 'complianceReporting', 'gdprCompliancePlatform', 'ccpaCompliance',
  'hipaaCompliancePlatform', 'pciDssCompliancePlatform', 'soc2CompliancePlatform', 'iso27001Compliance', 'dataEncryption'
 ];

 try {
  const store = await prisma.store.findUnique({
   where: { id: storeId },
   select: { settings: true }
  });

  if (!store) {
   return [];
  }

  for (const feature of allFeatures) {
   if (hasFeature(store.settings, feature)) {
    available.push(feature);
   }
  }

  return available;
 } catch (error) {
  console.error('Error getting available features:', error);
  return [];
 }
};


/**
 * Format features for API response
 * @param features - FeatureFlags object
 * @returns Formatted feature list with categories
 */
export const formatFeaturesForResponse = (features: FeatureFlags): {
 marketingSales: string[];
 storeManagement: string[];
 advancedCommerce: string[];
 supportBranding: string[];
 aiFeatures: string[];
 platformOwner: string[];
 vendorManagement: string[];
 financial: string[];
 securityCompliance: string[];
 all: string[];
} => {
 const marketingSales = [
  'bulkProductImport', 'emailMarketing', 'facebookPixel', 'googleAnalytics',
  'discountAutomation', 'loyaltyProgram', 'flashSales', 'pushNotifications',
  'reTargetingAds', 'influencerMarketing', 'affiliateTracking'
 ].filter(f => features[f as FeatureKey]);

 const storeManagement = [
  'multiLanguage', 'posIntegration', 'inventoryAlerts', 'productVariants',
  'bundleProducts', 'seasonalThemes', 'backOrders', 'groupBuying', 'dailyDeals', 'seasonalDiscounts'
 ].filter(f => features[f as FeatureKey]);

 const advancedCommerce = [
  'membershipTiers', 'giftCards', 'bookingSystem', 'waitlist', 'preOrders', 'wholesalePricing',
  'loyaltyPoints', 'rewardsProgram', 'storeCredit', 'priceMatch', 'priceAlert'
 ].filter(f => features[f as FeatureKey]);

 const supportBranding = [
  'whiteLabelBranding', 'apiAccess', 'customReports', 'advancedSegmentation', 'auditLogs',
  'customerPortals', 'returnPortal', 'giftRegistries'
 ].filter(f => features[f as FeatureKey]);

 const aiFeatures = [
  'aiDemandForecasting', 'aiCustomerLifetimeValue', 'aiPriceElasticity', 'aiMarketBasketAnalysis',
  'aiCustomerSegmentation', 'aiTrendPrediction', 'aiCompetitorAnalysis', 'aiPersonalizedRecommendations',
  'aiDynamicPricing', 'aiSearchOptimization', 'aiVisualSearch', 'aiVoiceSearch', 'aiChatbotAdvanced',
  'aiReviewSummarization', 'aiProductComparison', 'aiInventoryPrediction', 'aiFraudDetection',
  'aiShippingOptimization', 'aiReturnPrediction', 'aiQualityControl', 'aiSupplierManagement',
  'aiDemandPlanning', 'aiAutoCataloging'
 ].filter(f => features[f as FeatureKey]);

 const platformOwner = [
  'platformName', 'platformLogo', 'platformTheme', 'platformCurrency', 'platformLanguage',
  'timezone', 'dateFormat', 'emailSettings', 'smtpSettings', 'emailTemplates',
  'pushSettings', 'smsSettings', 'notificationSettings', 'maintenanceMode', 'platformStatus'
 ].filter(f => features[f as FeatureKey]);

 const vendorManagement = [
  'vendorApproval', 'vendorVerification', 'vendorKyc', 'vendorContracts', 'vendorOnboarding',
  'vendorTraining', 'vendorSupport', 'vendorCommunication', 'vendorPerformance'
 ].filter(f => features[f as FeatureKey]);

 const financial = [
  'commissionStructure', 'commissionTiers', 'commissionRules', 'commissionCalculation',
  'commissionPayout', 'commissionHold', 'commissionTax', 'commissionReporting', 'platformRevenue'
 ].filter(f => features[f as FeatureKey]);

 const securityCompliance = [
  'platformSecurity', 'platformCompliance', 'dataRetention', 'privacyPolicyPlatform',
  'termsOfService', 'passwordPolicy', 'ipWhitelist', 'geoBlocking'
 ].filter(f => features[f as FeatureKey]);

 return {
  marketingSales,
  storeManagement,
  advancedCommerce,
  supportBranding,
  aiFeatures,
  platformOwner,
  vendorManagement,
  financial,
  securityCompliance,
  all: [
   ...marketingSales, ...storeManagement, ...advancedCommerce, ...supportBranding, ...aiFeatures,
   ...platformOwner, ...vendorManagement, ...financial, ...securityCompliance
  ]
 };
};

