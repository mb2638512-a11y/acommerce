import { Request, Response, NextFunction, RequestHandler } from 'express';
import prisma from '../utils/prisma';
import { FeatureKey, FeatureFlags, getFeaturesForPlan, getFeatureForPlan, PLAN_TIERS, PlanTier, PLATFORM_PLANS, AiFeatureKey, getAiFeatureForPlan, CoreFeatureKey, getCoreFeatureForPlan, AdvancedFeatureKey, getAdvancedFeatureForPlan } from '../config/platformPlans';
import { getStorePlanTier } from '../utils/storePlan';

// Extended request type that includes store ID
export interface StoreRequest extends Request {
 storeId?: string;
 storeSettings?: Record<string, unknown>;
 storePlanTier?: PlanTier;
}

// Get store settings from database
const getStoreSettings = async (storeId: string): Promise<Record<string, unknown> | null> => {
 try {
  const store = await prisma.store.findUnique({
   where: { id: storeId },
   select: { settings: true }
  });
  if (typeof store?.settings === 'string') {
   try {
    return JSON.parse(store.settings);
   } catch (e) {
    return {};
   }
  }
  return (store?.settings as any) || null;
 } catch (error) {
  console.error('Error fetching store settings:', error);
  return null;
 }
};

// Generic feature check function
const checkFeatureAccess = async (
 storeId: string,
 feature: FeatureKey
): Promise<{ hasAccess: boolean; tier: PlanTier; featureFlags: FeatureFlags } | null> => {
 const settings = await getStoreSettings(storeId);

 if (!settings) {
  return null;
 }

 const tier = getStorePlanTier(settings);
 const featureFlags = getFeaturesForPlan(tier);
 const hasAccess = getFeatureForPlan(tier, feature);

 return { hasAccess, tier, featureFlags };
};

// Generic AI feature check function
const checkAiFeatureAccess = async (
 storeId: string,
 feature: AiFeatureKey
): Promise<{ hasAccess: boolean; tier: PlanTier } | null> => {
 const settings = await getStoreSettings(storeId);

 if (!settings) {
  return null;
 }

 const tier = getStorePlanTier(settings);
 const hasAccess = getAiFeatureForPlan(tier, feature);

 return { hasAccess, tier };
};

// Generic core feature check function
const checkCoreFeatureAccess = async (
 storeId: string,
 feature: CoreFeatureKey
): Promise<{ hasAccess: boolean; tier: PlanTier } | null> => {
 const settings = await getStoreSettings(storeId);

 if (!settings) {
  return null;
 }

 const tier = getStorePlanTier(settings);
 const hasAccess = getCoreFeatureForPlan(tier, feature);

 return { hasAccess, tier };
};

// Generic advanced feature check function
const checkAdvancedFeatureAccess = async (
 storeId: string,
 feature: AdvancedFeatureKey
): Promise<{ hasAccess: boolean; tier: PlanTier } | null> => {
 const settings = await getStoreSettings(storeId);

 if (!settings) {
  return null;
 }

 const tier = getStorePlanTier(settings);
 const hasAccess = getAdvancedFeatureForPlan(tier, feature);

 return { hasAccess, tier };
};

// Generic middleware factory for any feature
export const requireFeature = (featureName: FeatureKey): RequestHandler => {
 return async (req: StoreRequest, res: Response, next: NextFunction): Promise<void> => {
  const storeId = req.params.storeId;

  if (!storeId) {
   res.status(400).json({ error: 'Store ID is required' });
   return;
  }

  const result = await checkFeatureAccess(storeId, featureName);

  if (!result) {
   res.status(404).json({ error: 'Store not found' });
   return;
  }

  if (!result.hasAccess) {
   // Find the minimum tier required for this feature
   let requiredTier: PlanTier = 'ENTERPRISE';
   for (const tier of PLAN_TIERS) {
    if (getFeatureForPlan(tier, featureName)) {
     requiredTier = tier;
     break;
    }
   }

   res.status(403).json({
    error: 'Feature not available',
    message: `The "${featureName}" feature requires a ${PLATFORM_PLANS[requiredTier].label} plan or higher`,
    feature: featureName,
    currentPlan: result.tier,
    requiredPlan: requiredTier,
    availableFeatures: result.featureFlags
   });
   return;
  }

  // Store the feature flags in request for later use
  req.storeSettings = result.featureFlags as unknown as Record<string, unknown>;
  req.storePlanTier = result.tier;

  next();
 };
};

// Generic middleware factory for any AI feature
export const requireAiFeature = (featureName: AiFeatureKey): RequestHandler => {
 return async (req: StoreRequest, res: Response, next: NextFunction): Promise<void> => {
  const storeId = req.params.storeId;

  if (!storeId) {
   res.status(400).json({ error: 'Store ID is required' });
   return;
  }

  const result = await checkAiFeatureAccess(storeId, featureName);

  if (!result) {
   res.status(404).json({ error: 'Store not found' });
   return;
  }

  if (!result.hasAccess) {
   // Find the minimum tier required for this AI feature
   let requiredTier: PlanTier = 'ENTERPRISE';
   for (const tier of PLAN_TIERS) {
    if (getAiFeatureForPlan(tier, featureName)) {
     requiredTier = tier;
     break;
    }
   }

   res.status(403).json({
    error: 'AI Feature not available',
    message: `The "${featureName}" AI feature requires a ${PLATFORM_PLANS[requiredTier].label} plan or higher`,
    feature: featureName,
    currentPlan: result.tier,
    requiredPlan: requiredTier
   });
   return;
  }

  req.storePlanTier = result.tier;

  next();
 };
};

// Generic middleware factory for any core feature
export const requireCoreFeature = (featureName: CoreFeatureKey): RequestHandler => {
 return async (req: StoreRequest, res: Response, next: NextFunction): Promise<void> => {
  const storeId = req.params.storeId;

  if (!storeId) {
   res.status(400).json({ error: 'Store ID is required' });
   return;
  }

  const result = await checkCoreFeatureAccess(storeId, featureName);

  if (!result) {
   res.status(404).json({ error: 'Store not found' });
   return;
  }

  if (!result.hasAccess) {
   // Find the minimum tier required for this core feature
   let requiredTier: PlanTier = 'ENTERPRISE';
   for (const tier of PLAN_TIERS) {
    if (getCoreFeatureForPlan(tier, featureName)) {
     requiredTier = tier;
     break;
    }
   }

   res.status(403).json({
    error: 'Core Feature not available',
    message: `The "${featureName}" core feature requires a ${PLATFORM_PLANS[requiredTier].label} plan or higher`,
    feature: featureName,
    currentPlan: result.tier,
    requiredPlan: requiredTier
   });
   return;
  }

  req.storePlanTier = result.tier;

  next();
 };
};

// Generic middleware factory for any advanced feature
export const requireAdvancedFeature = (featureName: AdvancedFeatureKey): RequestHandler => {
 return async (req: StoreRequest, res: Response, next: NextFunction): Promise<void> => {
  const storeId = req.params.storeId;

  if (!storeId) {
   res.status(400).json({ error: 'Store ID is required' });
   return;
  }

  const result = await checkAdvancedFeatureAccess(storeId, featureName);

  if (!result) {
   res.status(404).json({ error: 'Store not found' });
   return;
  }

  if (!result.hasAccess) {
   // Find the minimum tier required for this advanced feature
   let requiredTier: PlanTier = 'ENTERPRISE';
   for (const tier of PLAN_TIERS) {
    if (getAdvancedFeatureForPlan(tier, featureName)) {
     requiredTier = tier;
     break;
    }
   }

   res.status(403).json({
    error: 'Advanced Feature not available',
    message: `The "${featureName}" advanced feature requires a ${PLATFORM_PLANS[requiredTier].label} plan or higher`,
    feature: featureName,
    currentPlan: result.tier,
    requiredPlan: requiredTier
   });
   return;
  }

  req.storePlanTier = result.tier;

  next();
 };
};

// Pre-built middleware for all 25 premium features

// Marketing & Sales features
export const requireBulkProductImport = requireFeature('bulkProductImport');
export const requireEmailMarketing = requireFeature('emailMarketing');
export const requireFacebookPixel = requireFeature('facebookPixel');
export const requireGoogleAnalytics = requireFeature('googleAnalytics');
export const requireDiscountAutomation = requireFeature('discountAutomation');
export const requireLoyaltyProgram = requireFeature('loyaltyProgram');
export const requireFlashSales = requireFeature('flashSales');
export const requirePushNotifications = requireFeature('pushNotifications');

// Store Management features
export const requireMultiLanguage = requireFeature('multiLanguage');
export const requirePosIntegration = requireFeature('posIntegration');
export const requireInventoryAlerts = requireFeature('inventoryAlerts');
export const requireProductVariants = requireFeature('productVariants');
export const requireBundleProducts = requireFeature('bundleProducts');
export const requireSeasonalThemes = requireFeature('seasonalThemes');

// Advanced Commerce features
export const requireMembershipTiers = requireFeature('membershipTiers');
export const requireGiftCards = requireFeature('giftCards');
export const requireBookingSystem = requireFeature('bookingSystem');
export const requireWaitlist = requireFeature('waitlist');
export const requirePreOrders = requireFeature('preOrders');
export const requireWholesalePricing = requireFeature('wholesalePricing');

// Support & Branding features
export const requireWhiteLabelBranding = requireFeature('whiteLabelBranding');
export const requireApiAccess = requireFeature('apiAccess');
export const requireCustomReports = requireFeature('customReports');
export const requireAdvancedSegmentation = requireFeature('advancedSegmentation');
export const requireAuditLogs = requireFeature('auditLogs');

// Original 4 features (for completeness)
export const requireAdvancedAnalytics = requireFeature('advancedAnalytics');
export const requirePrioritySupport = requireFeature('prioritySupport');
export const requireCustomDomain = requireFeature('customDomain');
export const requireAbandonedCartRecovery = requireFeature('abandonedCartRecovery');

// AI Feature Middleware - 25 new features

// AI Content Generation (features 1-6)
export const requireAiProductDescriptions = requireAiFeature('aiProductDescriptions');
export const requireAiSeoOptimization = requireAiFeature('aiSeoOptimization');
export const requireAiContentTranslation = requireAiFeature('aiContentTranslation');
export const requireAiBlogWriting = requireAiFeature('aiBlogWriting');
export const requireAiEmailDrafting = requireAiFeature('aiEmailDrafting');
export const requireAiAdCopy = requireAiFeature('aiAdCopy');

// AI Customer Service (features 7-11)
export const requireAiChatbot = requireAiFeature('aiChatbot');
export const requireAiVoiceAssistant = requireAiFeature('aiVoiceAssistant');
export const requireAiSentimentAnalysis = requireAiFeature('aiSentimentAnalysis');
export const requireAiAutoResponder = requireAiFeature('aiAutoResponder');
export const requireAiTicketRouting = requireAiFeature('aiTicketRouting');

// AI Analytics & Insights (features 12-16)
export const requireAiSalesForecasting = requireAiFeature('aiSalesForecasting');
export const requireAiCustomerInsights = requireAiFeature('aiCustomerInsights');
export const requireAiChurnPrediction = requireAiFeature('aiChurnPrediction');
export const requireAiPriceOptimization = requireAiFeature('aiPriceOptimization');
export const requireAiTrendDetection = requireAiFeature('aiTrendDetection');

// AI Visual & Media (features 17-21)
export const requireAiImageGeneration = requireAiFeature('aiImageGeneration');
export const requireAiImageEnhancement = requireAiFeature('aiImageEnhancement');
export const requireAiBackgroundRemoval = requireAiFeature('aiBackgroundRemoval');
export const requireAiVideoGeneration = requireAiFeature('aiVideoGeneration');
export const requireAiVirtualTryOn = requireAiFeature('aiVirtualTryOn');

// AI Marketing & Automation (features 22-25)
export const requireAiPersonalization = requireAiFeature('aiPersonalization');
export const requireAiAudienceSegmentation = requireAiFeature('aiAudienceSegmentation');
export const requireAiCampaignOptimizer = requireAiFeature('aiCampaignOptimizer');
export const requireAiAbTesting = requireAiFeature('aiAbTesting');

// Core Feature Middleware - 25 features

// Payment Processing (features 1-5)
export const requirePaypalIntegration = requireCoreFeature('paypalIntegration');
export const requireApplePay = requireCoreFeature('applePay');
export const requireGooglePay = requireCoreFeature('googlePay');
export const requireBuyNowPayLater = requireCoreFeature('buyNowPayLater');
export const requireMultiCurrency = requireCoreFeature('multiCurrency');

// Shipping & Fulfillment (features 6-10)
export const requireMultipleCarriers = requireCoreFeature('multipleCarriers');
export const requireShippingLabels = requireCoreFeature('shippingLabels');
export const requireShipmentTracking = requireCoreFeature('shipmentTracking');
export const requireFreeShipping = requireCoreFeature('freeShipping');
export const requireLocalPickup = requireCoreFeature('localPickup');

// Tax & Compliance (features 11-13)
export const requireAutomaticTax = requireCoreFeature('automaticTax');
export const requireVatHandling = requireCoreFeature('vatHandling');
export const requireTaxReports = requireCoreFeature('taxReports');

// Order Management (features 14-17)
export const requirePartialRefunds = requireCoreFeature('partialRefunds');
export const requirePackingSlips = requireCoreFeature('packingSlips');
export const requireOrderExport = requireCoreFeature('orderExport');
export const requireReturnManagement = requireCoreFeature('returnManagement');

// Security & Compliance (features 18-20)
export const requireTwoFactorAuth = requireCoreFeature('twoFactorAuth');
export const requireGdprCompliance = requireCoreFeature('gdprCompliance');
export const requireSessionManagement = requireCoreFeature('sessionManagement');

// Third-party Integrations (features 21-25)
export const requireQuickbooksIntegration = requireCoreFeature('quickbooksIntegration');
export const requireZendeskIntegration = requireCoreFeature('zendeskIntegration');
export const requireSlackIntegration = requireCoreFeature('slackIntegration');
export const requireMarketplaceAmazon = requireCoreFeature('marketplaceAmazon');
export const requireMarketplaceEbay = requireCoreFeature('marketplaceEbay');

// ====== ADVANCED FEATURE MIDDLEWARE - 175 NEW FEATURES ======

// Advanced Marketing (30 features)
export const requireSmsMarketing = requireAdvancedFeature('smsMarketing');
export const requireAffiliateProgram = requireAdvancedFeature('affiliateProgram');
export const requireReferralProgram = requireAdvancedFeature('referralProgram');
export const requirePopupBuilder = requireAdvancedFeature('popupBuilder');
export const requireCountdownTimers = requireAdvancedFeature('countdownTimers');
export const requireSocialSharing = requireAdvancedFeature('socialSharing');
export const requireWishlistSharing = requireAdvancedFeature('wishlistSharing');
export const requireProductRecommendations = requireAdvancedFeature('productRecommendations');
export const requireRelatedProducts = requireAdvancedFeature('relatedProducts');
export const requireRecentlyViewed = requireAdvancedFeature('recentlyViewed');
export const requireCrossSelling = requireAdvancedFeature('crossSelling');
export const requireUpselling = requireAdvancedFeature('upselling');
export const requireAbandonedCheckoutRecovery = requireAdvancedFeature('abandonedCheckoutRecovery');
export const requirePostPurchaseUpsell = requireAdvancedFeature('postPurchaseUpsell');
export const requireCheckoutAbandonment = requireAdvancedFeature('checkoutAbandonment');
export const requireCartAbandonment = requireAdvancedFeature('cartAbandonment');
export const requireDynamicPricing = requireAdvancedFeature('dynamicPricing');
export const requireVolumeDiscounts = requireAdvancedFeature('volumeDiscounts');
export const requireTieredPricing = requireAdvancedFeature('tieredPricing');
export const requireCustomerGroupPricing = requireAdvancedFeature('customerGroupPricing');
export const requireGeoTargeting = requireAdvancedFeature('geoTargeting');
export const requirePopUpNotifications = requireAdvancedFeature('popUpNotifications');
export const requireAnnouncementBars = requireAdvancedFeature('announcementBars');
export const requireNewsletterSignup = requireAdvancedFeature('newsletterSignup');
export const requireLeadCapture = requireAdvancedFeature('leadCapture');
export const requireLandingPageBuilder = requireAdvancedFeature('landingPageBuilder');
export const requireUrlShortener = requireAdvancedFeature('urlShortener');
export const requireQrCodeGenerator = requireAdvancedFeature('qrCodeGenerator');
export const requireSocialProof = requireAdvancedFeature('socialProof');
export const requireUrgencyIndicators = requireAdvancedFeature('urgencyIndicators');

// Advanced Store Management (30 features)
export const requireStockManagement = requireAdvancedFeature('stockManagement');
export const requireLowStockThreshold = requireAdvancedFeature('lowStockThreshold');
export const requireOutOfStockManagement = requireAdvancedFeature('outOfStockManagement');
export const requireDiscontinuedProducts = requireAdvancedFeature('discontinuedProducts');
export const requireProductTemplates = requireAdvancedFeature('productTemplates');
export const requireCategoryManagement = requireAdvancedFeature('categoryManagement');
export const requireAttributeManagement = requireAdvancedFeature('attributeManagement');
export const requireBrandManagement = requireAdvancedFeature('brandManagement');
export const requireVendorManagement = requireAdvancedFeature('vendorManagement');
export const requireSupplierManagement = requireAdvancedFeature('supplierManagement');
export const requireCostTracking = requireAdvancedFeature('costTracking');
export const requireProfitMarginCalculation = requireAdvancedFeature('profitMarginCalculation');
export const requireBarcodeGeneration = requireAdvancedFeature('barcodeGeneration');
export const requireSkuGenerator = requireAdvancedFeature('skuGenerator');
export const requireUpcEanGenerator = requireAdvancedFeature('upcEanGenerator');
export const requireProductWeightDimensions = requireAdvancedFeature('productWeightDimensions');
export const requireShippingDimensions = requireAdvancedFeature('shippingDimensions');
export const requireHsCodeClassification = requireAdvancedFeature('hsCodeClassification');
export const requireManufacturerInfo = requireAdvancedFeature('manufacturerInfo');
export const requireWarrantyInfo = requireAdvancedFeature('warrantyInfo');
export const requireReturnPolicy = requireAdvancedFeature('returnPolicy');
export const requireRefundPolicy = requireAdvancedFeature('refundPolicy');
export const requireShippingPolicy = requireAdvancedFeature('shippingPolicy');
export const requirePrivacyPolicy = requireAdvancedFeature('privacyPolicy');
export const requireTermsConditions = requireAdvancedFeature('termsConditions');
export const requireCookieConsent = requireAdvancedFeature('cookieConsent');
export const requireAgeVerification = requireAdvancedFeature('ageVerification');
export const requireProductRating = requireAdvancedFeature('productRating');
export const requireReviewManagement = requireAdvancedFeature('reviewManagement');
export const requireQaSection = requireAdvancedFeature('qaSection');

// Advanced Orders (25 features)
export const requireOrderStatuses = requireAdvancedFeature('orderStatuses');
export const requireOrderNotes = requireAdvancedFeature('orderNotes');
export const requireOrderMessages = requireAdvancedFeature('orderMessages');
export const requireOrderAttachments = requireAdvancedFeature('orderAttachments');
export const requireOrderHistory = requireAdvancedFeature('orderHistory');
export const requireOrderTimeline = requireAdvancedFeature('orderTimeline');
export const requireOrderTracking = requireAdvancedFeature('orderTracking');
export const requireOrderWorkflows = requireAdvancedFeature('orderWorkflows');
export const requireOrderApproval = requireAdvancedFeature('orderApproval');
export const requireOrderHold = requireAdvancedFeature('orderHold');
export const requireOrderCancel = requireAdvancedFeature('orderCancel');
export const requireOrderMerge = requireAdvancedFeature('orderMerge');
export const requireOrderSplit = requireAdvancedFeature('orderSplit');
export const requireOrderDuplicate = requireAdvancedFeature('orderDuplicate');
export const requireInvoiceGeneration = requireAdvancedFeature('invoiceGeneration');
export const requireCreditMemos = requireAdvancedFeature('creditMemos');
export const requireOrderReminders = requireAdvancedFeature('orderReminders');
export const requireBackorderProcessing = requireAdvancedFeature('backorderProcessing');
export const requirePreOrderManagement = requireAdvancedFeature('preOrderManagement');
export const requireSubscriptionOrders = requireAdvancedFeature('subscriptionOrders');
export const requireRecurringOrders = requireAdvancedFeature('recurringOrders');
export const requireWholesaleOrders = requireAdvancedFeature('wholesaleOrders');
export const requireBulkOrderProcessing = requireAdvancedFeature('bulkOrderProcessing');
export const requireOrderImport = requireAdvancedFeature('orderImport');
export const requireOrderSearch = requireAdvancedFeature('orderSearch');
export const requireOrderFiltering = requireAdvancedFeature('orderFiltering');

// Advanced Customers (25 features)
export const requireCustomerRegistration = requireAdvancedFeature('customerRegistration');
export const requireCustomerLogin = requireAdvancedFeature('customerLogin');
export const requireCustomerProfiles = requireAdvancedFeature('customerProfiles');
export const requireCustomerAddresses = requireAdvancedFeature('customerAddresses');
export const requireCustomerPhone = requireAdvancedFeature('customerPhone');
export const requireCustomerNotes = requireAdvancedFeature('customerNotes');
export const requireCustomerTags = requireAdvancedFeature('customerTags');
export const requireCustomerGroups = requireAdvancedFeature('customerGroups');
export const requireCustomerSegments = requireAdvancedFeature('customerSegments');
export const requireVipCustomers = requireAdvancedFeature('vipCustomers');
export const requireCustomerRanking = requireAdvancedFeature('customerRanking');
export const requireCustomerBirthday = requireAdvancedFeature('customerBirthday');
export const requireCustomerAnniversary = requireAdvancedFeature('customerAnniversary');
export const requireCustomerPreferences = requireAdvancedFeature('customerPreferences');
export const requireCustomerNotifications = requireAdvancedFeature('customerNotifications');
export const requireCustomerWishlist = requireAdvancedFeature('customerWishlist');
export const requireCustomerReviews = requireAdvancedFeature('customerReviews');
export const requireCustomerReferrals = requireAdvancedFeature('customerReferrals');
export const requireCustomerLoyalty = requireAdvancedFeature('customerLoyalty');
export const requireCustomerPoints = requireAdvancedFeature('customerPoints');
export const requireCustomerRewards = requireAdvancedFeature('customerRewards');
export const requireCustomerTierUpgrade = requireAdvancedFeature('customerTierUpgrade');
export const requireCustomerDowngrade = requireAdvancedFeature('customerDowngrade');
export const requireCustomerChurn = requireAdvancedFeature('customerChurn');
export const requireCustomerReactivation = requireAdvancedFeature('customerReactivation');

// Advanced Analytics (25 features)
export const requireSalesReports = requireAdvancedFeature('salesReports');
export const requireRevenueReports = requireAdvancedFeature('revenueReports');
export const requireProductReports = requireAdvancedFeature('productReports');
export const requireCategoryReports = requireAdvancedFeature('categoryReports');
export const requireCustomerReports = requireAdvancedFeature('customerReports');
export const requireTrafficReports = requireAdvancedFeature('trafficReports');
export const requireConversionReports = requireAdvancedFeature('conversionReports');
export const requireCartAbandonmentReports = requireAdvancedFeature('cartAbandonmentReports');
export const requireSourceReports = requireAdvancedFeature('sourceReports');
export const requireUtmReports = requireAdvancedFeature('utmReports');
export const requireDeviceReports = requireAdvancedFeature('deviceReports');
export const requireLocationReports = requireAdvancedFeature('locationReports');
export const requireReportsScheduling = requireAdvancedFeature('reportsScheduling');
export const requireReportsExport = requireAdvancedFeature('reportsExport');
export const requireCustomDashboards = requireAdvancedFeature('customDashboards');
export const requireKpiTracking = requireAdvancedFeature('kpiTracking');
export const requireGoalTracking = requireAdvancedFeature('goalTracking');
export const requireBenchmarkComparison = requireAdvancedFeature('benchmarkComparison');
export const requirePredictiveAnalytics = requireAdvancedFeature('predictiveAnalytics');
export const requireCohortAnalysis = requireAdvancedFeature('cohortAnalysis');
export const requireLifetimeValue = requireAdvancedFeature('lifetimeValue');
export const requireAttributionModeling = requireAdvancedFeature('attributionModeling');
export const requireCampaignPerformance = requireAdvancedFeature('campaignPerformance');
export const requireEmailPerformance = requireAdvancedFeature('emailPerformance');
export const requireSocialPerformance = requireAdvancedFeature('socialPerformance');

// Advanced Integrations (25 features)
export const requireShopifyImport = requireAdvancedFeature('shopifyImport');
export const requireWalmartChannel = requireAdvancedFeature('walmartChannel');
export const requireEtsyChannel = requireAdvancedFeature('etsyChannel');
export const requireAmazonChannel = requireAdvancedFeature('amazonChannel');
export const requireEbayChannel = requireAdvancedFeature('ebayChannel');
export const requireBigCommerceImport = requireAdvancedFeature('bigCommerceImport');
export const requireWooCommerceImport = requireAdvancedFeature('woocommerceImport');
export const requireMagentoImport = requireAdvancedFeature('magentoImport');
export const requireQuickbooksDesktop = requireAdvancedFeature('quickbooksDesktop');
export const requireXero = requireAdvancedFeature('xero');
export const requireFreshbooks = requireAdvancedFeature('freshbooks');
export const requireZoho = requireAdvancedFeature('zoho');
export const requireHubspot = requireAdvancedFeature('hubspot');
export const requireSalesforce = requireAdvancedFeature('salesforce');
export const requireMailchimp = requireAdvancedFeature('mailchimp');
export const requireKlaviyo = requireAdvancedFeature('klaviyo');
export const requireActivecampaign = requireAdvancedFeature('activecampaign');
export const requireConvertkit = requireAdvancedFeature('convertkit');
export const requireSendgrid = requireAdvancedFeature('sendgrid');
export const requireTwilio = requireAdvancedFeature('twilio');
export const requireNexmo = requireAdvancedFeature('nexmo');
export const requireStripeRadar = requireAdvancedFeature('stripeRadar');
export const requirePaypalVenmo = requireAdvancedFeature('paypalVenmo');
export const requireApplePayGateway = requireAdvancedFeature('applePayGateway');
export const requireGooglePayGateway = requireAdvancedFeature('googlePayGateway');

// Advanced Security & Performance (20 features)
export const requireSslCertificate = requireAdvancedFeature('sslCertificate');
export const requireDdosProtection = requireAdvancedFeature('ddosProtection');
export const requireFirewallProtection = requireAdvancedFeature('firewallProtection');
export const requireMalwareScanning = requireAdvancedFeature('malwareScanning');
export const requireBackupRestore = requireAdvancedFeature('backupRestore');
export const requireCdn = requireAdvancedFeature('cdn');
export const requireCaching = requireAdvancedFeature('caching');
export const requireImageOptimization = requireAdvancedFeature('imageOptimization');
export const requireCodeMinification = requireAdvancedFeature('codeMinification');
export const requireLazyLoading = requireAdvancedFeature('lazyLoading');
export const requirePageSpeed = requireAdvancedFeature('pageSpeed');
export const requireMobileOptimized = requireAdvancedFeature('mobileOptimized');
export const requireAmpSupport = requireAdvancedFeature('ampSupport');
export const requirePwaSupport = requireAdvancedFeature('pwaSupport');
export const requireHttp2Support = requireAdvancedFeature('http2Support');
export const requireGzipCompression = requireAdvancedFeature('gzipCompression');
export const requireDatabaseOptimization = requireAdvancedFeature('databaseOptimization');
export const requireQueryOptimization = requireAdvancedFeature('queryOptimization');
export const requireCdnGlobal = requireAdvancedFeature('cdnGlobal');
export const requireEdgeComputing = requireAdvancedFeature('edgeComputing');

// Advanced Mobile & Channel (20 features)
export const requireIosApp = requireAdvancedFeature('iosApp');
export const requireAndroidApp = requireAdvancedFeature('androidApp');
export const requireMobileSite = requireAdvancedFeature('mobileSite');
export const requireMobileCheckout = requireAdvancedFeature('mobileCheckout');
export const requireMobilePayment = requireAdvancedFeature('mobilePayment');
export const requireAppleWatch = requireAdvancedFeature('appleWatch');
export const requireTabletOptimized = requireAdvancedFeature('tabletOptimized');
export const requireDesktopApp = requireAdvancedFeature('desktopApp');
export const requireWindowsApp = requireAdvancedFeature('windowsApp');
export const requireMacApp = requireAdvancedFeature('macApp');
export const requirePosMobile = requireAdvancedFeature('posMobile');
export const requireQrCodeCheckout = requireAdvancedFeature('qrCodeCheckout');
export const requireNfcCheckout = requireAdvancedFeature('nfcCheckout');
export const requireVoiceCheckout = requireAdvancedFeature('voiceCheckout');
export const requireChatbotMobile = requireAdvancedFeature('chatbotMobile');
export const requireSmsOrdering = requireAdvancedFeature('smsOrdering');
export const requireWhatsappBusiness = requireAdvancedFeature('whatsappBusiness');
export const requireInstagramShopping = requireAdvancedFeature('instagramShopping');
export const requireFacebookShop = requireAdvancedFeature('facebookShop');
export const requireTiktokShop = requireAdvancedFeature('tiktokShop');

// Advanced Automation (25 features)
export const requireWorkflowBuilder = requireAdvancedFeature('workflowBuilder');
export const requireTriggerActions = requireAdvancedFeature('triggerActions');
export const requireTimeTriggers = requireAdvancedFeature('timeTriggers');
export const requireEventTriggers = requireAdvancedFeature('eventTriggers');
export const requireConditionTriggers = requireAdvancedFeature('conditionTriggers');
export const requireAutomationSequences = requireAdvancedFeature('automationSequences');
export const requireDripCampaigns = requireAdvancedFeature('dripCampaigns');
export const requireOnboardingFlows = requireAdvancedFeature('onboardingFlows');
export const requireOnboardingSequence = requireAdvancedFeature('onboardingSequence');
export const requireOnboardingEmails = requireAdvancedFeature('onboardingEmails');
export const requireWinBackFlow = requireAdvancedFeature('winBackFlow');
export const requireReviewRequestFlow = requireAdvancedFeature('reviewRequestFlow');
export const requireShippingNotificationFlow = requireAdvancedFeature('shippingNotificationFlow');
export const requireOrderConfirmationFlow = requireAdvancedFeature('orderConfirmationFlow');
export const requireRefundFlow = requireAdvancedFeature('refundFlow');
export const requireSupportEscalation = requireAdvancedFeature('supportEscalation');
export const requireLeadScoring = requireAdvancedFeature('leadScoring');
export const requireBehaviorTriggers = requireAdvancedFeature('behaviorTriggers');
export const requireSegmentUpdate = requireAdvancedFeature('segmentUpdate');
export const requireTagUpdate = requireAdvancedFeature('tagUpdate');
export const requireListManagement = requireAdvancedFeature('listManagement');
export const requireUnsubscribes = requireAdvancedFeature('unsubscribes');
export const requireSpamComplaints = requireAdvancedFeature('spamComplaints');
export const requireBounces = requireAdvancedFeature('bounces');
export const requireDeliveryTracking = requireAdvancedFeature('deliveryTracking');

// Advanced Developer (25 features)
export const requireWebhooks = requireAdvancedFeature('webhooks');
export const requireRestApi = requireAdvancedFeature('restApi');
export const requireGraphqlApi = requireAdvancedFeature('graphqlApi');
export const requireSdk = requireAdvancedFeature('sdk');
export const requireMobileSdk = requireAdvancedFeature('mobileSdk');
export const requirePluginFramework = requireAdvancedFeature('pluginFramework');
export const requireThemeEditor = requireAdvancedFeature('themeEditor');
export const requireCodeAccess = requireAdvancedFeature('codeAccess');
export const requireCustomCss = requireAdvancedFeature('customCss');
export const requireCustomJs = requireAdvancedFeature('customJs');
export const requireCustomDomainNew = requireAdvancedFeature('customDomainNew');
export const requireSubdomain = requireAdvancedFeature('subdomain');
export const requireCnameRecord = requireAdvancedFeature('cnameRecord');
export const requireMxRecord = requireAdvancedFeature('mxRecord');
export const requireApiKeys = requireAdvancedFeature('apiKeys');
export const requireApiRateLimiting = requireAdvancedFeature('apiRateLimiting');
export const requireApiLogging = requireAdvancedFeature('apiLogging');
export const requireWebhooksDebug = requireAdvancedFeature('webhooksDebug');
export const requireSandboxMode = requireAdvancedFeature('sandboxMode');
export const requireTestMode = requireAdvancedFeature('testMode');
export const requireDeveloperDocs = requireAdvancedFeature('developerDocs');
export const requireCommunityForum = requireAdvancedFeature('communityForum');
export const requireFeatureRequest = requireAdvancedFeature('featureRequest');
export const requireBugTracker = requireAdvancedFeature('bugTracker');
export const requireBetaAccess = requireAdvancedFeature('betaAccess');

// ====== PLATFORM OWNER MIDDLEWARE ======
export const requirePlatformName = requireFeature('platformName');
export const requirePlatformLogo = requireFeature('platformLogo');
export const requirePlatformTheme = requireFeature('platformTheme');
export const requirePlatformCurrency = requireFeature('platformCurrency');
export const requirePlatformLanguage = requireFeature('platformLanguage');
export const requireMaintenanceMode = requireFeature('maintenanceMode');
export const requirePlatformStatus = requireFeature('platformStatus');
export const requirePlatformUpdates = requireFeature('platformUpdates');
export const requirePlatformAnalytics = requireFeature('platformAnalytics');
export const requirePlatformLogs = requireFeature('platformLogs');
export const requirePlatformSecurity = requireFeature('platformSecurity');
export const requirePlatformCompliance = requireFeature('platformCompliance');

// ====== VENDOR MANAGEMENT MIDDLEWARE ======
export const requireVendorApproval = requireFeature('vendorApproval');
export const requireVendorVerification = requireFeature('vendorVerification');
export const requireVendorKyc = requireFeature('vendorKyc');
export const requireVendorContracts = requireFeature('vendorContracts');
export const requireVendorOnboarding = requireFeature('vendorOnboarding');
export const requireVendorSupport = requireFeature('vendorSupport');
export const requireVendorPerformance = requireFeature('vendorPerformance');
export const requireVendorPayouts = requireFeature('vendorPayouts');
export const requireVendorCommissions = requireFeature('vendorCommissions');

// ====== FINANCIAL & REVENUE MIDDLEWARE ======
export const requireCommissionStructure = requireFeature('commissionStructure');
export const requireCommissionRules = requireFeature('commissionRules');
export const requireCommissionCalculation = requireFeature('commissionCalculation');
export const requirePlatformRevenue = requireFeature('platformRevenue');
export const requireRevenueShare = requireFeature('revenueShare');
export const requirePlatformRevenueReports = requireFeature('platformRevenueReports');
export const requireInvoiceGenerationPlatform = requireFeature('invoiceGenerationPlatform');
export const requirePaymentProcessing = requireFeature('paymentProcessing');

// ====== MARKETPLACE & CATALOG MIDDLEWARE ======
export const requireMultiVendor = requireFeature('multiVendor');
export const requireVendorStores = requireFeature('vendorStores');
export const requireMarketplaceSearch = requireFeature('marketplaceSearch');
export const requireCategoryManagementPlatform = requireFeature('categoryManagementPlatform');
export const requireProductApproval = requireFeature('productApproval');
export const requireProductModeration = requireFeature('productModeration');

// Middleware that checks if store is on a specific tier or higher
export const requirePlanTier = (minimumTier: PlanTier): RequestHandler => {
 const tierIndex = PLAN_TIERS.indexOf(minimumTier);

 return async (req: StoreRequest, res: Response, next: NextFunction): Promise<void> => {
  const storeId = req.params.storeId;

  if (!storeId) {
   res.status(400).json({ error: 'Store ID is required' });
   return;
  }

  const settings = await getStoreSettings(storeId);

  if (!settings) {
   res.status(404).json({ error: 'Store not found' });
   return;
  }

  const currentTier = getStorePlanTier(settings);
  const currentTierIndex = PLAN_TIERS.indexOf(currentTier);

  if (currentTierIndex < tierIndex) {
   res.status(403).json({
    error: 'Plan tier too low',
    message: `This feature requires a ${PLATFORM_PLANS[minimumTier].label} plan or higher`,
    currentPlan: currentTier,
    requiredPlan: minimumTier,
    availableFeatures: getFeaturesForPlan(currentTier)
   });
   return;
  }

  req.storePlanTier = currentTier;

  next();
 };
};

// Export feature list for reference
export const ALL_PREMIUM_FEATURES: FeatureKey[] = [
 // Marketing & Sales
 'bulkProductImport',
 'emailMarketing',
 'facebookPixel',
 'googleAnalytics',
 'discountAutomation',
 'loyaltyProgram',
 'flashSales',
 'pushNotifications',
 // Store Management
 'multiLanguage',
 'posIntegration',
 'inventoryAlerts',
 'productVariants',
 'bundleProducts',
 'seasonalThemes',
 // Advanced Commerce
 'membershipTiers',
 'giftCards',
 'bookingSystem',
 'waitlist',
 'preOrders',
 'wholesalePricing',
 // Support & Branding
 'whiteLabelBranding',
 'apiAccess',
 'customReports',
 'advancedSegmentation',
 'auditLogs'
];

// Export all 25 AI features for reference
export const ALL_AI_FEATURES: AiFeatureKey[] = [
 // AI Content Generation
 'aiProductDescriptions',
 'aiSeoOptimization',
 'aiContentTranslation',
 'aiBlogWriting',
 'aiEmailDrafting',
 'aiAdCopy',
 // AI Customer Service
 'aiChatbot',
 'aiVoiceAssistant',
 'aiSentimentAnalysis',
 'aiAutoResponder',
 'aiTicketRouting',
 // AI Analytics & Insights
 'aiSalesForecasting',
 'aiCustomerInsights',
 'aiChurnPrediction',
 'aiPriceOptimization',
 'aiTrendDetection',
 // AI Visual & Media
 'aiImageGeneration',
 'aiImageEnhancement',
 'aiBackgroundRemoval',
 'aiVideoGeneration',
 'aiVirtualTryOn',
 // AI Marketing & Automation
 'aiPersonalization',
 'aiAudienceSegmentation',
 'aiCampaignOptimizer',
 'aiAbTesting'
];

// Export all 25 core features for reference
export const ALL_CORE_FEATURES: CoreFeatureKey[] = [
 // Payment Processing
 'paypalIntegration',
 'applePay',
 'googlePay',
 'buyNowPayLater',
 'multiCurrency',
 // Shipping & Fulfillment
 'multipleCarriers',
 'shippingLabels',
 'shipmentTracking',
 'freeShipping',
 'localPickup',
 // Tax & Compliance
 'automaticTax',
 'vatHandling',
 'taxReports',
 // Order Management
 'partialRefunds',
 'packingSlips',
 'orderExport',
 'returnManagement',
 // Security & Compliance
 'twoFactorAuth',
 'gdprCompliance',
 'sessionManagement',
 // Third-party Integrations
 'quickbooksIntegration',
 'zendeskIntegration',
 'slackIntegration',
 'marketplaceAmazon',
 'marketplaceEbay'
];

// Export all 175 advanced features for reference
export const ALL_ADVANCED_FEATURES: AdvancedFeatureKey[] = [
 // Advanced Marketing (30 features)
 'smsMarketing',
 'affiliateProgram',
 'referralProgram',
 'popupBuilder',
 'countdownTimers',
 'socialSharing',
 'wishlistSharing',
 'productRecommendations',
 'relatedProducts',
 'recentlyViewed',
 'crossSelling',
 'upselling',
 'abandonedCheckoutRecovery',
 'postPurchaseUpsell',
 'checkoutAbandonment',
 'cartAbandonment',
 'dynamicPricing',
 'volumeDiscounts',
 'tieredPricing',
 'customerGroupPricing',
 'geoTargeting',
 'popUpNotifications',
 'announcementBars',
 'newsletterSignup',
 'leadCapture',
 'landingPageBuilder',
 'urlShortener',
 'qrCodeGenerator',
 'socialProof',
 'urgencyIndicators',
 // Advanced Store Management (30 features)
 'stockManagement',
 'lowStockThreshold',
 'outOfStockManagement',
 'discontinuedProducts',
 'productTemplates',
 'categoryManagement',
 'attributeManagement',
 'brandManagement',
 'vendorManagement',
 'supplierManagement',
 'costTracking',
 'profitMarginCalculation',
 'barcodeGeneration',
 'skuGenerator',
 'upcEanGenerator',
 'productWeightDimensions',
 'shippingDimensions',
 'hsCodeClassification',
 'manufacturerInfo',
 'warrantyInfo',
 'returnPolicy',
 'refundPolicy',
 'shippingPolicy',
 'privacyPolicy',
 'termsConditions',
 'cookieConsent',
 'ageVerification',
 'productRating',
 'reviewManagement',
 'qaSection',
 // Advanced Orders (25 features)
 'orderStatuses',
 'orderNotes',
 'orderMessages',
 'orderAttachments',
 'orderHistory',
 'orderTimeline',
 'orderTracking',
 'orderWorkflows',
 'orderApproval',
 'orderHold',
 'orderCancel',
 'orderMerge',
 'orderSplit',
 'orderDuplicate',
 'invoiceGeneration',
 'creditMemos',
 'orderReminders',
 'backorderProcessing',
 'preOrderManagement',
 'subscriptionOrders',
 'recurringOrders',
 'wholesaleOrders',
 'bulkOrderProcessing',
 'orderImport',
 'orderSearch',
 'orderFiltering',
 // Advanced Customers (25 features)
 'customerRegistration',
 'customerLogin',
 'customerProfiles',
 'customerAddresses',
 'customerPhone',
 'customerNotes',
 'customerTags',
 'customerGroups',
 'customerSegments',
 'vipCustomers',
 'customerRanking',
 'customerBirthday',
 'customerAnniversary',
 'customerPreferences',
 'customerNotifications',
 'customerWishlist',
 'customerReviews',
 'customerReferrals',
 'customerLoyalty',
 'customerPoints',
 'customerRewards',
 'customerTierUpgrade',
 'customerDowngrade',
 'customerChurn',
 'customerReactivation',
 // Advanced Analytics (25 features)
 'salesReports',
 'revenueReports',
 'productReports',
 'categoryReports',
 'customerReports',
 'trafficReports',
 'conversionReports',
 'cartAbandonmentReports',
 'sourceReports',
 'utmReports',
 'deviceReports',
 'locationReports',
 'reportsScheduling',
 'reportsExport',
 'customDashboards',
 'kpiTracking',
 'goalTracking',
 'benchmarkComparison',
 'predictiveAnalytics',
 'cohortAnalysis',
 'lifetimeValue',
 'attributionModeling',
 'campaignPerformance',
 'emailPerformance',
 'socialPerformance',
 // Advanced Integrations (25 features)
 'shopifyImport',
 'walmartChannel',
 'etsyChannel',
 'amazonChannel',
 'ebayChannel',
 'bigCommerceImport',
 'woocommerceImport',
 'magentoImport',
 'quickbooksDesktop',
 'xero',
 'freshbooks',
 'zoho',
 'hubspot',
 'salesforce',
 'mailchimp',
 'klaviyo',
 'activecampaign',
 'convertkit',
 'sendgrid',
 'twilio',
 'nexmo',
 'stripeRadar',
 'paypalVenmo',
 'applePayGateway',
 'googlePayGateway',
 // Advanced Security & Performance (20 features)
 'sslCertificate',
 'ddosProtection',
 'firewallProtection',
 'malwareScanning',
 'backupRestore',
 'cdn',
 'caching',
 'imageOptimization',
 'codeMinification',
 'lazyLoading',
 'pageSpeed',
 'mobileOptimized',
 'ampSupport',
 'pwaSupport',
 'http2Support',
 'gzipCompression',
 'databaseOptimization',
 'queryOptimization',
 'cdnGlobal',
 'edgeComputing',
 // Advanced Mobile & Channel (20 features)
 'iosApp',
 'androidApp',
 'mobileSite',
 'mobileCheckout',
 'mobilePayment',
 'appleWatch',
 'tabletOptimized',
 'desktopApp',
 'windowsApp',
 'macApp',
 'posMobile',
 'qrCodeCheckout',
 'nfcCheckout',
 'voiceCheckout',
 'chatbotMobile',
 'smsOrdering',
 'whatsappBusiness',
 'instagramShopping',
 'facebookShop',
 'tiktokShop',
 // Advanced Automation (25 features)
 'workflowBuilder',
 'triggerActions',
 'timeTriggers',
 'eventTriggers',
 'conditionTriggers',
 'automationSequences',
 'dripCampaigns',
 'onboardingFlows',
 'onboardingSequence',
 'onboardingEmails',
 'winBackFlow',
 'reviewRequestFlow',
 'shippingNotificationFlow',
 'orderConfirmationFlow',
 'refundFlow',
 'supportEscalation',
 'leadScoring',
 'behaviorTriggers',
 'segmentUpdate',
 'tagUpdate',
 'listManagement',
 'unsubscribes',
 'spamComplaints',
 'bounces',
 'deliveryTracking',
 // Advanced Developer (25 features)
 'webhooks',
 'restApi',
 'graphqlApi',
 'sdk',
 'mobileSdk',
 'pluginFramework',
 'themeEditor',
 'codeAccess',
 'customCss',
 'customJs',
 'customDomainNew',
 'subdomain',
 'cnameRecord',
 'mxRecord',
 'apiKeys',
 'apiRateLimiting',
 'apiLogging',
 'webhooksDebug',
 'sandboxMode',
 'testMode',
 'developerDocs',
 'communityForum',
 'featureRequest',
 'bugTracker',
 'betaAccess'
];

// Feature group mapping for organized access checks
export const FEATURE_GROUPS_MAP: Record<string, FeatureKey[]> = {
 marketingSales: [
  'bulkProductImport',
  'emailMarketing',
  'facebookPixel',
  'googleAnalytics',
  'discountAutomation',
  'loyaltyProgram',
  'flashSales',
  'pushNotifications'
 ],
 storeManagement: [
  'multiLanguage',
  'posIntegration',
  'inventoryAlerts',
  'productVariants',
  'bundleProducts',
  'seasonalThemes'
 ],
 advancedCommerce: [
  'membershipTiers',
  'giftCards',
  'bookingSystem',
  'waitlist',
  'preOrders',
  'wholesalePricing'
 ],
 supportBranding: [
  'whiteLabelBranding',
  'apiAccess',
  'customReports',
  'advancedSegmentation',
  'auditLogs'
 ]
};

// AI Feature groups mapping
export const AI_FEATURE_GROUPS_MAP: Record<string, AiFeatureKey[]> = {
 aiContentGeneration: [
  'aiProductDescriptions',
  'aiSeoOptimization',
  'aiContentTranslation',
  'aiBlogWriting',
  'aiEmailDrafting',
  'aiAdCopy'
 ],
 aiCustomerService: [
  'aiChatbot',
  'aiVoiceAssistant',
  'aiSentimentAnalysis',
  'aiAutoResponder',
  'aiTicketRouting'
 ],
 aiAnalyticsInsights: [
  'aiSalesForecasting',
  'aiCustomerInsights',
  'aiChurnPrediction',
  'aiPriceOptimization',
  'aiTrendDetection'
 ],
 aiVisualMedia: [
  'aiImageGeneration',
  'aiImageEnhancement',
  'aiBackgroundRemoval',
  'aiVideoGeneration',
  'aiVirtualTryOn'
 ],
 aiMarketingAutomation: [
  'aiPersonalization',
  'aiAudienceSegmentation',
  'aiCampaignOptimizer',
  'aiAbTesting'
 ]
};

// Core Feature groups mapping
export const CORE_FEATURE_GROUPS_MAP: Record<string, CoreFeatureKey[]> = {
 paymentProcessing: [
  'paypalIntegration',
  'applePay',
  'googlePay',
  'buyNowPayLater',
  'multiCurrency'
 ],
 shippingFulfillment: [
  'multipleCarriers',
  'shippingLabels',
  'shipmentTracking',
  'freeShipping',
  'localPickup'
 ],
 taxCompliance: [
  'automaticTax',
  'vatHandling',
  'taxReports'
 ],
 orderManagement: [
  'partialRefunds',
  'packingSlips',
  'orderExport',
  'returnManagement'
 ],
 securityCompliance: [
  'twoFactorAuth',
  'gdprCompliance',
  'sessionManagement'
 ],
 thirdPartyIntegrations: [
  'quickbooksIntegration',
  'zendeskIntegration',
  'slackIntegration',
  'marketplaceAmazon',
  'marketplaceEbay'
 ]
};

// Advanced Feature groups mapping
export const ADVANCED_FEATURE_GROUPS_MAP: Record<string, AdvancedFeatureKey[]> = {
 advancedMarketing: [
  'smsMarketing',
  'affiliateProgram',
  'referralProgram',
  'popupBuilder',
  'countdownTimers',
  'socialSharing',
  'wishlistSharing',
  'productRecommendations',
  'relatedProducts',
  'recentlyViewed',
  'crossSelling',
  'upselling',
  'abandonedCheckoutRecovery',
  'postPurchaseUpsell',
  'checkoutAbandonment',
  'cartAbandonment',
  'dynamicPricing',
  'volumeDiscounts',
  'tieredPricing',
  'customerGroupPricing',
  'geoTargeting',
  'popUpNotifications',
  'announcementBars',
  'newsletterSignup',
  'leadCapture',
  'landingPageBuilder',
  'urlShortener',
  'qrCodeGenerator',
  'socialProof',
  'urgencyIndicators'
 ],
 advancedStoreManagement: [
  'stockManagement',
  'lowStockThreshold',
  'outOfStockManagement',
  'discontinuedProducts',
  'productTemplates',
  'categoryManagement',
  'attributeManagement',
  'brandManagement',
  'vendorManagement',
  'supplierManagement',
  'costTracking',
  'profitMarginCalculation',
  'barcodeGeneration',
  'skuGenerator',
  'upcEanGenerator',
  'productWeightDimensions',
  'shippingDimensions',
  'hsCodeClassification',
  'manufacturerInfo',
  'warrantyInfo',
  'returnPolicy',
  'refundPolicy',
  'shippingPolicy',
  'privacyPolicy',
  'termsConditions',
  'cookieConsent',
  'ageVerification',
  'productRating',
  'reviewManagement',
  'qaSection'
 ],
 advancedOrders: [
  'orderStatuses',
  'orderNotes',
  'orderMessages',
  'orderAttachments',
  'orderHistory',
  'orderTimeline',
  'orderTracking',
  'orderWorkflows',
  'orderApproval',
  'orderHold',
  'orderCancel',
  'orderMerge',
  'orderSplit',
  'orderDuplicate',
  'invoiceGeneration',
  'creditMemos',
  'orderReminders',
  'backorderProcessing',
  'preOrderManagement',
  'subscriptionOrders',
  'recurringOrders',
  'wholesaleOrders',
  'bulkOrderProcessing',
  'orderImport',
  'orderSearch',
  'orderFiltering'
 ],
 advancedCustomers: [
  'customerRegistration',
  'customerLogin',
  'customerProfiles',
  'customerAddresses',
  'customerPhone',
  'customerNotes',
  'customerTags',
  'customerGroups',
  'customerSegments',
  'vipCustomers',
  'customerRanking',
  'customerBirthday',
  'customerAnniversary',
  'customerPreferences',
  'customerNotifications',
  'customerWishlist',
  'customerReviews',
  'customerReferrals',
  'customerLoyalty',
  'customerPoints',
  'customerRewards',
  'customerTierUpgrade',
  'customerDowngrade',
  'customerChurn',
  'customerReactivation'
 ],
 advancedAnalytics: [
  'salesReports',
  'revenueReports',
  'productReports',
  'categoryReports',
  'customerReports',
  'trafficReports',
  'conversionReports',
  'cartAbandonmentReports',
  'sourceReports',
  'utmReports',
  'deviceReports',
  'locationReports',
  'reportsScheduling',
  'reportsExport',
  'customDashboards',
  'kpiTracking',
  'goalTracking',
  'benchmarkComparison',
  'predictiveAnalytics',
  'cohortAnalysis',
  'lifetimeValue',
  'attributionModeling',
  'campaignPerformance',
  'emailPerformance',
  'socialPerformance'
 ],
 advancedIntegrations: [
  'shopifyImport',
  'walmartChannel',
  'etsyChannel',
  'amazonChannel',
  'ebayChannel',
  'bigCommerceImport',
  'woocommerceImport',
  'magentoImport',
  'quickbooksDesktop',
  'xero',
  'freshbooks',
  'zoho',
  'hubspot',
  'salesforce',
  'mailchimp',
  'klaviyo',
  'activecampaign',
  'convertkit',
  'sendgrid',
  'twilio',
  'nexmo',
  'stripeRadar',
  'paypalVenmo',
  'applePayGateway',
  'googlePayGateway'
 ],
 advancedSecurity: [
  'sslCertificate',
  'ddosProtection',
  'firewallProtection',
  'malwareScanning',
  'backupRestore',
  'cdn',
  'caching',
  'imageOptimization',
  'codeMinification',
  'lazyLoading',
  'pageSpeed',
  'mobileOptimized',
  'ampSupport',
  'pwaSupport',
  'http2Support',
  'gzipCompression',
  'databaseOptimization',
  'queryOptimization',
  'cdnGlobal',
  'edgeComputing'
 ],
 advancedMobile: [
  'iosApp',
  'androidApp',
  'mobileSite',
  'mobileCheckout',
  'mobilePayment',
  'appleWatch',
  'tabletOptimized',
  'desktopApp',
  'windowsApp',
  'macApp',
  'posMobile',
  'qrCodeCheckout',
  'nfcCheckout',
  'voiceCheckout',
  'chatbotMobile',
  'smsOrdering',
  'whatsappBusiness',
  'instagramShopping',
  'facebookShop',
  'tiktokShop'
 ],
 advancedAutomation: [
  'workflowBuilder',
  'triggerActions',
  'timeTriggers',
  'eventTriggers',
  'conditionTriggers',
  'automationSequences',
  'dripCampaigns',
  'onboardingFlows',
  'onboardingSequence',
  'onboardingEmails',
  'winBackFlow',
  'reviewRequestFlow',
  'shippingNotificationFlow',
  'orderConfirmationFlow',
  'refundFlow',
  'supportEscalation',
  'leadScoring',
  'behaviorTriggers',
  'segmentUpdate',
  'tagUpdate',
  'listManagement',
  'unsubscribes',
  'spamComplaints',
  'bounces',
  'deliveryTracking'
 ],
 advancedDeveloper: [
  'webhooks',
  'restApi',
  'graphqlApi',
  'sdk',
  'mobileSdk',
  'pluginFramework',
  'themeEditor',
  'codeAccess',
  'customCss',
  'customJs',
  'customDomainNew',
  'subdomain',
  'cnameRecord',
  'mxRecord',
  'apiKeys',
  'apiRateLimiting',
  'apiLogging',
  'webhooksDebug',
  'sandboxMode',
  'testMode',
  'developerDocs',
  'communityForum',
  'featureRequest',
  'bugTracker',
  'betaAccess'
 ]
};
