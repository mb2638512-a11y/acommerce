import { DEFAULT_PLAN_TIER, getPlanByTier, PlanDefinition, PlanTier, FeatureKey, FeatureFlags, FEATURE_GROUPS, getFeatureForPlan, getFeaturesForPlan, hasFeatureGroup as checkPlanFeatureGroup, AiFeatureKey, getAiFeatureForPlan, getAiFeaturesForPlan, AI_FEATURE_GROUPS, hasAiFeatureGroup as checkAiPlanFeatureGroup, CoreFeatureKey, getCoreFeatureForPlan, getCoreFeaturesForPlan, CORE_FEATURE_GROUPS, hasCoreFeatureGroup as checkCorePlanFeatureGroup, AdvancedFeatureKey, getAdvancedFeatureForPlan, getAdvancedFeaturesForPlan, ADVANCED_FEATURE_GROUPS, hasAdvancedFeatureGroup as checkAdvancedPlanFeatureGroup } from '../config/platformPlans';

type PlainObject = Record<string, unknown>;

const asObject = (value: unknown): PlainObject => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return {};
    }
    return value as PlainObject;
};

export const getStorePlanTier = (settings: unknown): PlanTier => {
    const settingsObject = asObject(settings);
    const subscription = asObject(settingsObject.subscription);
    const tier = subscription.tier;

    if (typeof tier === 'string' && getPlanByTier(tier).tier === tier) {
        return tier as PlanTier;
    }

    return DEFAULT_PLAN_TIER;
};

export const getStorePlan = (settings: unknown): PlanDefinition => {
    return getPlanByTier(getStorePlanTier(settings));
};

// Check if a specific feature is available for a store
export const hasFeature = (settings: unknown, feature: FeatureKey): boolean => {
    const tier = getStorePlanTier(settings);
    return getFeatureForPlan(tier, feature);
};

// Get all features available for a store
export const getStoreFeatures = (settings: unknown): FeatureFlags => {
    const tier = getStorePlanTier(settings);
    return getFeaturesForPlan(tier);
};

// Check if store has access to all features in a category group
export const hasFeatureGroup = (settings: unknown, group: keyof typeof FEATURE_GROUPS): boolean => {
    const tier = getStorePlanTier(settings);
    return checkPlanFeatureGroup(tier, group);
};

// Check if a specific AI feature is available for a store
export const hasAiFeature = (settings: unknown, feature: AiFeatureKey): boolean => {
    const tier = getStorePlanTier(settings);
    return getAiFeatureForPlan(tier, feature);
};

// Get all AI features available for a store
export const getStoreAiFeatures = (settings: unknown): ReturnType<typeof getAiFeaturesForPlan> => {
    const tier = getStorePlanTier(settings);
    return getAiFeaturesForPlan(tier);
};

// Check if store has access to all AI features in a category group
export const hasAiFeatureGroup = (settings: unknown, group: keyof typeof AI_FEATURE_GROUPS): boolean => {
    const tier = getStorePlanTier(settings);
    return checkAiPlanFeatureGroup(tier, group);
};

// Check if a specific advanced feature is available for a store
export const hasAdvancedFeature = (settings: unknown, feature: AdvancedFeatureKey): boolean => {
    const tier = getStorePlanTier(settings);
    return getAdvancedFeatureForPlan(tier, feature);
};

// Get all advanced features available for a store
export const getStoreAdvancedFeatures = (settings: unknown): ReturnType<typeof getAdvancedFeaturesForPlan> => {
    const tier = getStorePlanTier(settings);
    return getAdvancedFeaturesForPlan(tier);
};

// Check if store has access to all advanced features in a category group
export const hasAdvancedFeatureGroup = (settings: unknown, group: keyof typeof ADVANCED_FEATURE_GROUPS): boolean => {
    const tier = getStorePlanTier(settings);
    return checkAdvancedPlanFeatureGroup(tier, group);
};

// Convenience checkers for common feature combinations
export const isAdvancedAnalyticsEnabled = (settings: unknown): boolean => hasFeature(settings, 'advancedAnalytics');
export const isPrioritySupportEnabled = (settings: unknown): boolean => hasFeature(settings, 'prioritySupport');
export const isCustomDomainEnabled = (settings: unknown): boolean => hasFeature(settings, 'customDomain');
export const isAbandonedCartRecoveryEnabled = (settings: unknown): boolean => hasFeature(settings, 'abandonedCartRecovery');

// Marketing & Sales features
export const isBulkProductImportEnabled = (settings: unknown): boolean => hasFeature(settings, 'bulkProductImport');
export const isEmailMarketingEnabled = (settings: unknown): boolean => hasFeature(settings, 'emailMarketing');
export const isFacebookPixelEnabled = (settings: unknown): boolean => hasFeature(settings, 'facebookPixel');
export const isGoogleAnalyticsEnabled = (settings: unknown): boolean => hasFeature(settings, 'googleAnalytics');
export const isDiscountAutomationEnabled = (settings: unknown): boolean => hasFeature(settings, 'discountAutomation');
export const isLoyaltyProgramEnabled = (settings: unknown): boolean => hasFeature(settings, 'loyaltyProgram');
export const isFlashSalesEnabled = (settings: unknown): boolean => hasFeature(settings, 'flashSales');
export const isPushNotificationsEnabled = (settings: unknown): boolean => hasFeature(settings, 'pushNotifications');

// Store Management features
export const isMultiLanguageEnabled = (settings: unknown): boolean => hasFeature(settings, 'multiLanguage');
export const isPosIntegrationEnabled = (settings: unknown): boolean => hasFeature(settings, 'posIntegration');
export const isInventoryAlertsEnabled = (settings: unknown): boolean => hasFeature(settings, 'inventoryAlerts');
export const isProductVariantsEnabled = (settings: unknown): boolean => hasFeature(settings, 'productVariants');
export const isBundleProductsEnabled = (settings: unknown): boolean => hasFeature(settings, 'bundleProducts');
export const isSeasonalThemesEnabled = (settings: unknown): boolean => hasFeature(settings, 'seasonalThemes');

// Advanced Commerce features
export const isMembershipTiersEnabled = (settings: unknown): boolean => hasFeature(settings, 'membershipTiers');
export const isGiftCardsEnabled = (settings: unknown): boolean => hasFeature(settings, 'giftCards');
export const isBookingSystemEnabled = (settings: unknown): boolean => hasFeature(settings, 'bookingSystem');
export const isWaitlistEnabled = (settings: unknown): boolean => hasFeature(settings, 'waitlist');
export const isPreOrdersEnabled = (settings: unknown): boolean => hasFeature(settings, 'preOrders');
export const isWholesalePricingEnabled = (settings: unknown): boolean => hasFeature(settings, 'wholesalePricing');

// Support & Branding features
export const isWhiteLabelBrandingEnabled = (settings: unknown): boolean => hasFeature(settings, 'whiteLabelBranding');
export const isApiAccessEnabled = (settings: unknown): boolean => hasFeature(settings, 'apiAccess');
export const isCustomReportsEnabled = (settings: unknown): boolean => hasFeature(settings, 'customReports');
export const isAdvancedSegmentationEnabled = (settings: unknown): boolean => hasFeature(settings, 'advancedSegmentation');
export const isAuditLogsEnabled = (settings: unknown): boolean => hasFeature(settings, 'auditLogs');

// AI Content Generation features
export const isAiProductDescriptionsEnabled = (settings: unknown): boolean => hasAiFeature(settings, 'aiProductDescriptions');
export const isAiSeoOptimizationEnabled = (settings: unknown): boolean => hasAiFeature(settings, 'aiSeoOptimization');
export const isAiContentTranslationEnabled = (settings: unknown): boolean => hasAiFeature(settings, 'aiContentTranslation');
export const isAiBlogWritingEnabled = (settings: unknown): boolean => hasAiFeature(settings, 'aiBlogWriting');
export const isAiEmailDraftingEnabled = (settings: unknown): boolean => hasAiFeature(settings, 'aiEmailDrafting');
export const isAiAdCopyEnabled = (settings: unknown): boolean => hasAiFeature(settings, 'aiAdCopy');

// AI Customer Service features
export const isAiChatbotEnabled = (settings: unknown): boolean => hasAiFeature(settings, 'aiChatbot');
export const isAiVoiceAssistantEnabled = (settings: unknown): boolean => hasAiFeature(settings, 'aiVoiceAssistant');
export const isAiSentimentAnalysisEnabled = (settings: unknown): boolean => hasAiFeature(settings, 'aiSentimentAnalysis');
export const isAiAutoResponderEnabled = (settings: unknown): boolean => hasAiFeature(settings, 'aiAutoResponder');
export const isAiTicketRoutingEnabled = (settings: unknown): boolean => hasAiFeature(settings, 'aiTicketRouting');

// AI Analytics & Insights features
export const isAiSalesForecastingEnabled = (settings: unknown): boolean => hasAiFeature(settings, 'aiSalesForecasting');
export const isAiCustomerInsightsEnabled = (settings: unknown): boolean => hasAiFeature(settings, 'aiCustomerInsights');
export const isAiChurnPredictionEnabled = (settings: unknown): boolean => hasAiFeature(settings, 'aiChurnPrediction');
export const isAiPriceOptimizationEnabled = (settings: unknown): boolean => hasAiFeature(settings, 'aiPriceOptimization');
export const isAiTrendDetectionEnabled = (settings: unknown): boolean => hasAiFeature(settings, 'aiTrendDetection');

// AI Visual & Media features
export const isAiImageGenerationEnabled = (settings: unknown): boolean => hasAiFeature(settings, 'aiImageGeneration');
export const isAiImageEnhancementEnabled = (settings: unknown): boolean => hasAiFeature(settings, 'aiImageEnhancement');
export const isAiBackgroundRemovalEnabled = (settings: unknown): boolean => hasAiFeature(settings, 'aiBackgroundRemoval');
export const isAiVideoGenerationEnabled = (settings: unknown): boolean => hasAiFeature(settings, 'aiVideoGeneration');
export const isAiVirtualTryOnEnabled = (settings: unknown): boolean => hasAiFeature(settings, 'aiVirtualTryOn');

// AI Marketing & Automation features
export const isAiPersonalizationEnabled = (settings: unknown): boolean => hasAiFeature(settings, 'aiPersonalization');
export const isAiAudienceSegmentationEnabled = (settings: unknown): boolean => hasAiFeature(settings, 'aiAudienceSegmentation');
export const isAiCampaignOptimizerEnabled = (settings: unknown): boolean => hasAiFeature(settings, 'aiCampaignOptimizer');
export const isAiAbTestingEnabled = (settings: unknown): boolean => hasAiFeature(settings, 'aiAbTesting');

// Check if a specific core feature is available for a store
export const hasCoreFeature = (settings: unknown, feature: CoreFeatureKey): boolean => {
    const tier = getStorePlanTier(settings);
    return getCoreFeatureForPlan(tier, feature);
};

// Get all core features available for a store
export const getStoreCoreFeatures = (settings: unknown): ReturnType<typeof getCoreFeaturesForPlan> => {
    const tier = getStorePlanTier(settings);
    return getCoreFeaturesForPlan(tier);
};

// Check if store has access to all core features in a category group
export const hasCoreFeatureGroup = (settings: unknown, group: keyof typeof CORE_FEATURE_GROUPS): boolean => {
    const tier = getStorePlanTier(settings);
    return checkCorePlanFeatureGroup(tier, group);
};

// Core Feature convenience checkers - Payment Processing
export const isPaypalIntegrationEnabled = (settings: unknown): boolean => hasCoreFeature(settings, 'paypalIntegration');
export const isApplePayEnabled = (settings: unknown): boolean => hasCoreFeature(settings, 'applePay');
export const isGooglePayEnabled = (settings: unknown): boolean => hasCoreFeature(settings, 'googlePay');
export const isBuyNowPayLaterEnabled = (settings: unknown): boolean => hasCoreFeature(settings, 'buyNowPayLater');
export const isMultiCurrencyEnabled = (settings: unknown): boolean => hasCoreFeature(settings, 'multiCurrency');

// Core Feature convenience checkers - Shipping & Fulfillment
export const isMultipleCarriersEnabled = (settings: unknown): boolean => hasCoreFeature(settings, 'multipleCarriers');
export const isShippingLabelsEnabled = (settings: unknown): boolean => hasCoreFeature(settings, 'shippingLabels');
export const isShipmentTrackingEnabled = (settings: unknown): boolean => hasCoreFeature(settings, 'shipmentTracking');
export const isFreeShippingEnabled = (settings: unknown): boolean => hasCoreFeature(settings, 'freeShipping');
export const isLocalPickupEnabled = (settings: unknown): boolean => hasCoreFeature(settings, 'localPickup');

// Core Feature convenience checkers - Tax & Compliance
export const isAutomaticTaxEnabled = (settings: unknown): boolean => hasCoreFeature(settings, 'automaticTax');
export const isVatHandlingEnabled = (settings: unknown): boolean => hasCoreFeature(settings, 'vatHandling');
export const isTaxReportsEnabled = (settings: unknown): boolean => hasCoreFeature(settings, 'taxReports');

// Core Feature convenience checkers - Order Management
export const isPartialRefundsEnabled = (settings: unknown): boolean => hasCoreFeature(settings, 'partialRefunds');
export const isPackingSlipsEnabled = (settings: unknown): boolean => hasCoreFeature(settings, 'packingSlips');
export const isOrderExportEnabled = (settings: unknown): boolean => hasCoreFeature(settings, 'orderExport');
export const isReturnManagementEnabled = (settings: unknown): boolean => hasCoreFeature(settings, 'returnManagement');

// Core Feature convenience checkers - Security & Compliance
export const isTwoFactorAuthEnabled = (settings: unknown): boolean => hasCoreFeature(settings, 'twoFactorAuth');
export const isGdprComplianceEnabled = (settings: unknown): boolean => hasCoreFeature(settings, 'gdprCompliance');
export const isSessionManagementEnabled = (settings: unknown): boolean => hasCoreFeature(settings, 'sessionManagement');

// Core Feature convenience checkers - Third-party Integrations
export const isQuickbooksIntegrationEnabled = (settings: unknown): boolean => hasCoreFeature(settings, 'quickbooksIntegration');
export const isZendeskIntegrationEnabled = (settings: unknown): boolean => hasCoreFeature(settings, 'zendeskIntegration');
export const isSlackIntegrationEnabled = (settings: unknown): boolean => hasCoreFeature(settings, 'slackIntegration');
export const isMarketplaceAmazonEnabled = (settings: unknown): boolean => hasCoreFeature(settings, 'marketplaceAmazon');
export const isMarketplaceEbayEnabled = (settings: unknown): boolean => hasCoreFeature(settings, 'marketplaceEbay');

// ====== ADVANCED FEATURE CONVENIENCE CHECKERS ======

// Advanced Marketing (30 features)
export const isSmsMarketingEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'smsMarketing');
export const isAffiliateProgramEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'affiliateProgram');
export const isReferralProgramEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'referralProgram');
export const isPopupBuilderEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'popupBuilder');
export const isCountdownTimersEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'countdownTimers');
export const isSocialSharingEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'socialSharing');
export const isWishlistSharingEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'wishlistSharing');
export const isProductRecommendationsEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'productRecommendations');
export const isRelatedProductsEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'relatedProducts');
export const isRecentlyViewedEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'recentlyViewed');
export const isCrossSellingEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'crossSelling');
export const isUpsellingEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'upselling');
export const isAbandonedCheckoutRecoveryEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'abandonedCheckoutRecovery');
export const isPostPurchaseUpsellEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'postPurchaseUpsell');
export const isCheckoutAbandonmentEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'checkoutAbandonment');
export const isCartAbandonmentEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'cartAbandonment');
export const isDynamicPricingEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'dynamicPricing');
export const isVolumeDiscountsEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'volumeDiscounts');
export const isTieredPricingEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'tieredPricing');
export const isCustomerGroupPricingEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'customerGroupPricing');
export const isGeoTargetingEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'geoTargeting');
export const isPopUpNotificationsEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'popUpNotifications');
export const isAnnouncementBarsEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'announcementBars');
export const isNewsletterSignupEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'newsletterSignup');
export const isLeadCaptureEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'leadCapture');
export const isLandingPageBuilderEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'landingPageBuilder');
export const isUrlShortenerEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'urlShortener');
export const isQrCodeGeneratorEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'qrCodeGenerator');
export const isSocialProofEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'socialProof');
export const isUrgencyIndicatorsEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'urgencyIndicators');

// Advanced Store Management (30 features)
export const isStockManagementEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'stockManagement');
export const isLowStockThresholdEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'lowStockThreshold');
export const isOutOfStockManagementEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'outOfStockManagement');
export const isDiscontinuedProductsEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'discontinuedProducts');
export const isProductTemplatesEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'productTemplates');
export const isCategoryManagementEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'categoryManagement');
export const isAttributeManagementEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'attributeManagement');
export const isBrandManagementEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'brandManagement');
export const isVendorManagementEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'vendorManagement');
export const isSupplierManagementEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'supplierManagement');
export const isCostTrackingEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'costTracking');
export const isProfitMarginCalculationEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'profitMarginCalculation');
export const isBarcodeGenerationEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'barcodeGeneration');
export const isSkuGeneratorEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'skuGenerator');
export const isUpcEanGeneratorEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'upcEanGenerator');
export const isProductWeightDimensionsEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'productWeightDimensions');
export const isShippingDimensionsEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'shippingDimensions');
export const isHsCodeClassificationEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'hsCodeClassification');
export const isManufacturerInfoEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'manufacturerInfo');
export const isWarrantyInfoEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'warrantyInfo');
export const isReturnPolicyEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'returnPolicy');
export const isRefundPolicyEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'refundPolicy');
export const isShippingPolicyEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'shippingPolicy');
export const isPrivacyPolicyEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'privacyPolicy');
export const isTermsConditionsEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'termsConditions');
export const isCookieConsentEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'cookieConsent');
export const isAgeVerificationEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'ageVerification');
export const isProductRatingEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'productRating');
export const isReviewManagementEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'reviewManagement');
export const isQaSectionEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'qaSection');

// Advanced Orders (25 features)
export const isOrderStatusesEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'orderStatuses');
export const isOrderNotesEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'orderNotes');
export const isOrderMessagesEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'orderMessages');
export const isOrderAttachmentsEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'orderAttachments');
export const isOrderHistoryEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'orderHistory');
export const isOrderTimelineEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'orderTimeline');
export const isOrderTrackingEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'orderTracking');
export const isOrderWorkflowsEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'orderWorkflows');
export const isOrderApprovalEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'orderApproval');
export const isOrderHoldEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'orderHold');
export const isOrderCancelEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'orderCancel');
export const isOrderMergeEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'orderMerge');
export const isOrderSplitEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'orderSplit');
export const isOrderDuplicateEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'orderDuplicate');
export const isInvoiceGenerationEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'invoiceGeneration');
export const isCreditMemosEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'creditMemos');
export const isOrderRemindersEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'orderReminders');
export const isBackorderProcessingEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'backorderProcessing');
export const isPreOrderManagementEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'preOrderManagement');
export const isSubscriptionOrdersEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'subscriptionOrders');
export const isRecurringOrdersEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'recurringOrders');
export const isWholesaleOrdersEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'wholesaleOrders');
export const isBulkOrderProcessingEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'bulkOrderProcessing');
export const isOrderImportEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'orderImport');
export const isOrderSearchEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'orderSearch');
export const isOrderFilteringEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'orderFiltering');

// Advanced Customers (25 features)
export const isCustomerRegistrationEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'customerRegistration');
export const isCustomerLoginEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'customerLogin');
export const isCustomerProfilesEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'customerProfiles');
export const isCustomerAddressesEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'customerAddresses');
export const isCustomerPhoneEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'customerPhone');
export const isCustomerNotesEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'customerNotes');
export const isCustomerTagsEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'customerTags');
export const isCustomerGroupsEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'customerGroups');
export const isCustomerSegmentsEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'customerSegments');
export const isVipCustomersEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'vipCustomers');
export const isCustomerRankingEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'customerRanking');
export const isCustomerBirthdayEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'customerBirthday');
export const isCustomerAnniversaryEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'customerAnniversary');
export const isCustomerPreferencesEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'customerPreferences');
export const isCustomerNotificationsEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'customerNotifications');
export const isCustomerWishlistEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'customerWishlist');
export const isCustomerReviewsEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'customerReviews');
export const isCustomerReferralsEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'customerReferrals');
export const isCustomerLoyaltyEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'customerLoyalty');
export const isCustomerPointsEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'customerPoints');
export const isCustomerRewardsEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'customerRewards');
export const isCustomerTierUpgradeEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'customerTierUpgrade');
export const isCustomerDowngradeEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'customerDowngrade');
export const isCustomerChurnEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'customerChurn');
export const isCustomerReactivationEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'customerReactivation');

// Advanced Analytics (25 features)
export const isSalesReportsEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'salesReports');
export const isRevenueReportsEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'revenueReports');
export const isProductReportsEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'productReports');
export const isCategoryReportsEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'categoryReports');
export const isCustomerReportsEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'customerReports');
export const isTrafficReportsEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'trafficReports');
export const isConversionReportsEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'conversionReports');
export const isCartAbandonmentReportsEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'cartAbandonmentReports');
export const isSourceReportsEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'sourceReports');
export const isUtmReportsEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'utmReports');
export const isDeviceReportsEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'deviceReports');
export const isLocationReportsEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'locationReports');
export const isReportsSchedulingEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'reportsScheduling');
export const isReportsExportEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'reportsExport');
export const isCustomDashboardsEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'customDashboards');
export const isKpiTrackingEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'kpiTracking');
export const isGoalTrackingEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'goalTracking');
export const isBenchmarkComparisonEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'benchmarkComparison');
export const isPredictiveAnalyticsEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'predictiveAnalytics');
export const isCohortAnalysisEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'cohortAnalysis');
export const isLifetimeValueEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'lifetimeValue');
export const isAttributionModelingEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'attributionModeling');
export const isCampaignPerformanceEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'campaignPerformance');
export const isEmailPerformanceEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'emailPerformance');
export const isSocialPerformanceEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'socialPerformance');

// Advanced Integrations (25 features)
export const isShopifyImportEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'shopifyImport');
export const isWalmartChannelEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'walmartChannel');
export const isEtsyChannelEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'etsyChannel');
export const isAmazonChannelEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'amazonChannel');
export const isEbayChannelEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'ebayChannel');
export const isBigCommerceImportEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'bigCommerceImport');
export const isWooCommerceImportEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'woocommerceImport');
export const isMagentoImportEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'magentoImport');
export const isQuickbooksDesktopEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'quickbooksDesktop');
export const isXeroEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'xero');
export const isFreshbooksEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'freshbooks');
export const isZohoEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'zoho');
export const isHubspotEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'hubspot');
export const isSalesforceEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'salesforce');
export const isMailchimpEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'mailchimp');
export const isKlaviyoEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'klaviyo');
export const isActivecampaignEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'activecampaign');
export const isConvertkitEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'convertkit');
export const isSendgridEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'sendgrid');
export const isTwilioEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'twilio');
export const isNexmoEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'nexmo');
export const isStripeRadarEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'stripeRadar');
export const isPaypalVenmoEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'paypalVenmo');
export const isApplePayGatewayEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'applePayGateway');
export const isGooglePayGatewayEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'googlePayGateway');

// Advanced Security & Performance (20 features)
export const isSslCertificateEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'sslCertificate');
export const isDdosProtectionEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'ddosProtection');
export const isFirewallProtectionEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'firewallProtection');
export const isMalwareScanningEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'malwareScanning');
export const isBackupRestoreEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'backupRestore');
export const isCdnEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'cdn');
export const isCachingEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'caching');
export const isImageOptimizationEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'imageOptimization');
export const isCodeMinificationEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'codeMinification');
export const isLazyLoadingEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'lazyLoading');
export const isPageSpeedEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'pageSpeed');
export const isMobileOptimizedEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'mobileOptimized');
export const isAmpSupportEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'ampSupport');
export const isPwaSupportEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'pwaSupport');
export const isHttp2SupportEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'http2Support');
export const isGzipCompressionEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'gzipCompression');
export const isDatabaseOptimizationEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'databaseOptimization');
export const isQueryOptimizationEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'queryOptimization');
export const isCdnGlobalEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'cdnGlobal');
export const isEdgeComputingEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'edgeComputing');

// Advanced Mobile & Channel (20 features)
export const isIosAppEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'iosApp');
export const isAndroidAppEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'androidApp');
export const isMobileSiteEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'mobileSite');
export const isMobileCheckoutEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'mobileCheckout');
export const isMobilePaymentEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'mobilePayment');
export const isAppleWatchEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'appleWatch');
export const isTabletOptimizedEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'tabletOptimized');
export const isDesktopAppEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'desktopApp');
export const isWindowsAppEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'windowsApp');
export const isMacAppEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'macApp');
export const isPosMobileEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'posMobile');
export const isQrCodeCheckoutEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'qrCodeCheckout');
export const isNfcCheckoutEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'nfcCheckout');
export const isVoiceCheckoutEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'voiceCheckout');
export const isChatbotMobileEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'chatbotMobile');
export const isSmsOrderingEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'smsOrdering');
export const isWhatsappBusinessEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'whatsappBusiness');
export const isInstagramShoppingEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'instagramShopping');
export const isFacebookShopEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'facebookShop');
export const isTiktokShopEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'tiktokShop');

// Advanced Automation (25 features)
export const isWorkflowBuilderEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'workflowBuilder');
export const isTriggerActionsEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'triggerActions');
export const isTimeTriggersEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'timeTriggers');
export const isEventTriggersEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'eventTriggers');
export const isConditionTriggersEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'conditionTriggers');
export const isAutomationSequencesEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'automationSequences');
export const isDripCampaignsEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'dripCampaigns');
export const isOnboardingFlowsEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'onboardingFlows');
export const isOnboardingSequenceEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'onboardingSequence');
export const isOnboardingEmailsEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'onboardingEmails');
export const isWinBackFlowEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'winBackFlow');
export const isReviewRequestFlowEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'reviewRequestFlow');
export const isShippingNotificationFlowEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'shippingNotificationFlow');
export const isOrderConfirmationFlowEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'orderConfirmationFlow');
export const isRefundFlowEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'refundFlow');
export const isSupportEscalationEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'supportEscalation');
export const isLeadScoringEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'leadScoring');
export const isBehaviorTriggersEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'behaviorTriggers');
export const isSegmentUpdateEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'segmentUpdate');
export const isTagUpdateEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'tagUpdate');
export const isListManagementEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'listManagement');
export const isUnsubscribesEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'unsubscribes');
export const isSpamComplaintsEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'spamComplaints');
export const isBouncesEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'bounces');
export const isDeliveryTrackingEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'deliveryTracking');

// Advanced Developer (25 features)
export const isWebhooksEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'webhooks');
export const isRestApiEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'restApi');
export const isGraphqlApiEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'graphqlApi');
export const isSdkEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'sdk');
export const isMobileSdkEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'mobileSdk');
export const isPluginFrameworkEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'pluginFramework');
export const isThemeEditorEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'themeEditor');
export const isCodeAccessEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'codeAccess');
export const isCustomCssEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'customCss');
export const isCustomJsEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'customJs');
export const isCustomDomainNewEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'customDomainNew');
export const isSubdomainEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'subdomain');
export const isCnameRecordEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'cnameRecord');
export const isMxRecordEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'mxRecord');
export const isApiKeysEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'apiKeys');
export const isApiRateLimitingEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'apiRateLimiting');
export const isApiLoggingEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'apiLogging');
export const isWebhooksDebugEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'webhooksDebug');
export const isSandboxModeEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'sandboxMode');
export const isTestModeEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'testMode');
export const isDeveloperDocsEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'developerDocs');
export const isCommunityForumEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'communityForum');
export const isFeatureRequestEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'featureRequest');
export const isBugTrackerEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'bugTracker');
export const isBetaAccessEnabled = (settings: unknown): boolean => hasAdvancedFeature(settings, 'betaAccess');

// ====== PLATFORM OWNER CONVENIENCE CHECKERS ======
export const isPlatformAnalyticsEnabled = (settings: unknown): boolean => hasFeature(settings, 'platformAnalytics');
export const isPlatformLogsEnabled = (settings: unknown): boolean => hasFeature(settings, 'platformLogs');
export const isPlatformSecurityEnabled = (settings: unknown): boolean => hasFeature(settings, 'platformSecurity');
export const isPlatformComplianceEnabled = (settings: unknown): boolean => hasFeature(settings, 'platformCompliance');
export const isMaintenanceModeEnabled = (settings: unknown): boolean => hasFeature(settings, 'maintenanceMode');

// ====== VENDOR MANAGEMENT CONVENIENCE CHECKERS ======
export const isMultiVendorEnabled = (settings: unknown): boolean => hasFeature(settings, 'multiVendor');
export const isVendorApprovalEnabled = (settings: unknown): boolean => hasFeature(settings, 'vendorApproval');
export const isVendorVerificationEnabled = (settings: unknown): boolean => hasFeature(settings, 'vendorVerification');
export const isVendorPerformanceEnabled = (settings: unknown): boolean => hasFeature(settings, 'vendorPerformance');
export const isCommissionCalculationEnabled = (settings: unknown): boolean => hasFeature(settings, 'commissionCalculation');
export const isPlatformRevenueEnabled = (settings: unknown): boolean => hasFeature(settings, 'platformRevenue');

export const withUpdatedPlanSettings = (settings: unknown, tier: PlanTier): PlainObject => {
    const settingsObject = asObject(settings);
    const subscription = asObject(settingsObject.subscription);

    return {
        ...settingsObject,
        subscription: {
            ...subscription,
            tier,
            status: 'active',
            updatedAt: new Date().toISOString()
        }
    };
};

export const withDefaultSubscription = (settings: unknown): PlainObject => {
    const tier = getStorePlanTier(settings);
    return withUpdatedPlanSettings(settings, tier);
};
