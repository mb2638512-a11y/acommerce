export const PLAN_TIERS = ['STARTER', 'PRO', 'PREMIUM', 'ENTERPRISE'] as const;
export type PlanTier = typeof PLAN_TIERS[number];

// Commission rates for seller accounts based on plan tier
export const PLAN_COMMISSION_RATES: Record<string, number> = {
    FREE: 0.05,       // 5% commission
    STARTER: 0.05,    // 5% commission
    PRO: 0.02,        // 2% commission
    PREMIUM: 0.01,    // 1% commission
    ENTERPRISE: 0,   // 0% commission (enterprise gets 0%)
};

// Get commission rate for a plan tier
export const getCommissionRate = (planTier: string): number => {
    return PLAN_COMMISSION_RATES[planTier] ?? 0.05;
};

// Feature flags interface for e-commerce platform (~280 features)
// Refactored to focus only on e-commerce relevant features
export interface FeatureFlags {
    // ====== ORIGINAL CORE FEATURES (25 features) ======
    // Basic Features
    advancedAnalytics: boolean;
    prioritySupport: boolean;
    customDomain: boolean;
    abandonedCartRecovery: boolean;

    // Marketing & Sales (8 features)
    bulkProductImport: boolean;
    emailMarketing: boolean;
    facebookPixel: boolean;
    googleAnalytics: boolean;
    discountAutomation: boolean;
    loyaltyProgram: boolean;
    flashSales: boolean;
    pushNotifications: boolean;

    // Store Management (6 features)
    multiLanguage: boolean;
    posIntegration: boolean;
    inventoryAlerts: boolean;
    productVariants: boolean;
    bundleProducts: boolean;
    seasonalThemes: boolean;

    // Advanced Commerce (6 features)
    membershipTiers: boolean;
    giftCards: boolean;
    bookingSystem: boolean;
    waitlist: boolean;
    preOrders: boolean;
    wholesalePricing: boolean;

    // Support & Branding (5 features)
    whiteLabelBranding: boolean;
    apiAccess: boolean;
    customReports: boolean;
    advancedSegmentation: boolean;
    auditLogs: boolean;

    // ====== AI FEATURES FOR E-COMMERCE (20 features) ======
    // AI Content Generation (5)
    aiProductDescriptions: boolean;
    aiSeoOptimization: boolean;
    aiContentTranslation: boolean;
    aiBlogWriting: boolean;
    aiEmailDrafting: boolean;
    aiAdCopy: boolean;

    // AI Customer Service (5)
    aiChatbot: boolean;
    aiVoiceAssistant: boolean;
    aiSentimentAnalysis: boolean;
    aiAutoResponder: boolean;
    aiTicketRouting: boolean;

    // AI Analytics & Insights (5)
    aiSalesForecasting: boolean;
    aiCustomerInsights: boolean;
    aiChurnPrediction: boolean;
    aiPriceOptimization: boolean;
    aiTrendDetection: boolean;

    // AI Visual & Media (5)
    aiImageGeneration: boolean;
    aiImageEnhancement: boolean;
    aiBackgroundRemoval: boolean;
    aiVideoGeneration: boolean;
    aiVirtualTryOn: boolean;

    // AI Marketing (4)
    aiPersonalization: boolean;
    aiAudienceSegmentation: boolean;
    aiCampaignOptimizer: boolean;
    aiAbTesting: boolean;

    // ====== NEW AI FEATURES FOR E-COMMERCE (25 features) ======
    // Advanced AI Analytics (8)
    aiDemandForecasting: boolean;
    aiCustomerLifetimeValue: boolean;
    aiPriceElasticity: boolean;
    aiMarketBasketAnalysis: boolean;
    aiCustomerSegmentation: boolean;
    aiTrendPrediction: boolean;
    aiCompetitorAnalysis: boolean;

    // AI Customer Experience (9)
    aiPersonalizedRecommendations: boolean;
    aiDynamicPricing: boolean;
    aiSearchOptimization: boolean;
    aiVisualSearch: boolean;
    aiVoiceSearch: boolean;
    aiChatbotAdvanced: boolean;
    aiReviewSummarization: boolean;
    aiProductComparison: boolean;

    // AI Operations (8)
    aiInventoryPrediction: boolean;
    aiFraudDetection: boolean;
    aiShippingOptimization: boolean;
    aiReturnPrediction: boolean;
    aiQualityControl: boolean;
    aiSupplierManagement: boolean;
    aiDemandPlanning: boolean;
    aiAutoCataloging: boolean;

    // ====== AUTO PILOT FEATURES FOR E-COMMERCE (70 features) ======
    // Auto Pilot Core (20 features)
    autoPilotEnabled: boolean;
    aiDashboard: boolean;
    smartSuggestions: boolean;
    automatedDecisions: boolean;
    predictiveInsights: boolean;
    anomalyDetection: boolean;
    anomalyAlerts: boolean;
    smartNotifications: boolean;
    dailyBriefing: boolean;
    weeklyReport: boolean;
    trendAnalysis: boolean;
    opportunityDetection: boolean;
    riskAssessment: boolean;
    recommendationEngine: boolean;
    naturalLanguageQueries: boolean;
    aiVoiceCommands: boolean;
    smartSearch: boolean;
    contextualHelp: boolean;
    automatedOnboarding: boolean;
    smartTutorial: boolean;

    // Seller Auto Pilot (25 features)
    autoInventoryManagement: boolean;
    autoPricing: boolean;
    autoReorder: boolean;
    autoProductListings: boolean;
    autoSeo: boolean;
    autoAdSpend: boolean;
    autoEmailMarketing: boolean;
    autoSocialPosting: boolean;
    autoCustomerResponse: boolean;
    autoReviewResponse: boolean;
    autoOrderProcessing: boolean;
    autoRefund: boolean;
    autoCustomerSupport: boolean;
    autoAnalytics: boolean;
    autoCompetitorAnalysis: boolean;
    autoTrendProducts: boolean;
    autoPricingStrategy: boolean;
    autoInventoryAlerts: boolean;
    autoAbandonedCart: boolean;
    autoLoyaltyProgram: boolean;
    autoUpselling: boolean;
    autoCrossSelling: boolean;
    autoDiscounts: boolean;
    autoFlashSales: boolean;
    autoSeasonalCampaigns: boolean;

    // Platform Owner Auto Pilot (25 features)
    autoVendorApproval: boolean;
    autoVendorMonitoring: boolean;
    autoFraudDetection: boolean;
    autoDisputeResolution: boolean;
    autoCompliance: boolean;
    autoRevenueOptimization: boolean;
    autoCommission: boolean;
    autoPlatformAnalytics: boolean;
    autoMarketInsights: boolean;
    autoTrendIdentification: boolean;
    autoUserBehavior: boolean;
    autoChurnPrediction: boolean;
    autoGrowthHacking: boolean;
    autoCampaignManagement: boolean;
    autoPartnerManagement: boolean;
    autoSupportRouting: boolean;
    autoContentModeration: boolean;
    autoPricingBenchmarking: boolean;
    autoCompetitiveIntelligence: boolean;
    autoRiskManagement: boolean;
    autoResourceScaling: boolean;
    autoSecurityMonitoring: boolean;
    autoPerformance: boolean;
    autoBackup: boolean;
    autoComplianceReports: boolean;

    // ====== CORE PLATFORM FEATURES (25 features) ======
    // Payment Processing (5)
    paypalIntegration: boolean;
    applePay: boolean;
    googlePay: boolean;
    buyNowPayLater: boolean;
    multiCurrency: boolean;

    // Shipping & Fulfillment (5)
    multipleCarriers: boolean;
    shippingLabels: boolean;
    shipmentTracking: boolean;
    freeShipping: boolean;
    localPickup: boolean;

    // Tax & Compliance (3)
    automaticTax: boolean;
    vatHandling: boolean;
    taxReports: boolean;

    // Order Management (4)
    partialRefunds: boolean;
    packingSlips: boolean;
    orderExport: boolean;
    returnManagement: boolean;

    // Security & Compliance (3)
    twoFactorAuth: boolean;
    gdprCompliance: boolean;
    sessionManagement: boolean;

    // Third-party Integrations (5)
    quickbooksIntegration: boolean;
    zendeskIntegration: boolean;
    slackIntegration: boolean;
    marketplaceAmazon: boolean;
    marketplaceEbay: boolean;

    // ====== ADVANCED MARKETING (30 features) ======
    smsMarketing: boolean;
    affiliateProgram: boolean;
    referralProgram: boolean;
    popupBuilder: boolean;
    countdownTimers: boolean;
    socialSharing: boolean;
    wishlistSharing: boolean;
    productRecommendations: boolean;
    relatedProducts: boolean;
    recentlyViewed: boolean;
    crossSelling: boolean;
    upselling: boolean;
    abandonedCheckoutRecovery: boolean;
    postPurchaseUpsell: boolean;
    checkoutAbandonment: boolean;
    cartAbandonment: boolean;
    dynamicPricing: boolean;
    volumeDiscounts: boolean;
    tieredPricing: boolean;
    customerGroupPricing: boolean;
    geoTargeting: boolean;
    popUpNotifications: boolean;
    announcementBars: boolean;
    newsletterSignup: boolean;
    leadCapture: boolean;
    landingPageBuilder: boolean;
    urlShortener: boolean;
    qrCodeGenerator: boolean;
    socialProof: boolean;
    urgencyIndicators: boolean;

    // ====== ADVANCED STORE MANAGEMENT (30 features) ======
    stockManagement: boolean;
    lowStockThreshold: boolean;
    outOfStockManagement: boolean;
    discontinuedProducts: boolean;
    productTemplates: boolean;
    categoryManagement: boolean;
    attributeManagement: boolean;
    brandManagement: boolean;
    vendorManagement: boolean;
    supplierManagement: boolean;
    costTracking: boolean;
    profitMarginCalculation: boolean;
    barcodeGeneration: boolean;
    skuGenerator: boolean;
    upcEanGenerator: boolean;
    productWeightDimensions: boolean;
    shippingDimensions: boolean;
    hsCodeClassification: boolean;
    manufacturerInfo: boolean;
    warrantyInfo: boolean;
    returnPolicy: boolean;
    refundPolicy: boolean;
    shippingPolicy: boolean;
    privacyPolicy: boolean;
    termsConditions: boolean;
    cookieConsent: boolean;
    ageVerification: boolean;
    productRating: boolean;
    reviewManagement: boolean;
    qaSection: boolean;

    // ====== ADVANCED ORDERS (25 features) ======
    orderStatuses: boolean;
    orderNotes: boolean;
    orderMessages: boolean;
    orderAttachments: boolean;
    orderHistory: boolean;
    orderTimeline: boolean;
    orderTracking: boolean;
    orderWorkflows: boolean;
    orderApproval: boolean;
    orderHold: boolean;
    orderCancel: boolean;
    orderMerge: boolean;
    orderSplit: boolean;
    orderDuplicate: boolean;
    invoiceGeneration: boolean;
    creditMemos: boolean;
    orderReminders: boolean;
    backorderProcessing: boolean;
    preOrderManagement: boolean;
    subscriptionOrders: boolean;
    recurringOrders: boolean;
    wholesaleOrders: boolean;
    bulkOrderProcessing: boolean;
    orderImport: boolean;
    orderSearch: boolean;
    orderFiltering: boolean;

    // ====== ADVANCED CUSTOMERS (25 features) ======
    customerRegistration: boolean;
    customerLogin: boolean;
    customerProfiles: boolean;
    customerAddresses: boolean;
    customerPhone: boolean;
    customerNotes: boolean;
    customerTags: boolean;
    customerGroups: boolean;
    customerSegments: boolean;
    vipCustomers: boolean;
    customerRanking: boolean;
    customerBirthday: boolean;
    customerAnniversary: boolean;
    customerPreferences: boolean;
    customerNotifications: boolean;
    customerWishlist: boolean;
    customerReviews: boolean;
    customerReferrals: boolean;
    customerLoyalty: boolean;
    customerPoints: boolean;
    customerRewards: boolean;
    customerTierUpgrade: boolean;
    customerDowngrade: boolean;
    customerChurn: boolean;
    customerReactivation: boolean;

    // ====== ADVANCED ANALYTICS (25 features) ======
    salesReports: boolean;
    revenueReports: boolean;
    productReports: boolean;
    categoryReports: boolean;
    customerReports: boolean;
    trafficReports: boolean;
    conversionReports: boolean;
    cartAbandonmentReports: boolean;
    sourceReports: boolean;
    utmReports: boolean;
    deviceReports: boolean;
    locationReports: boolean;
    reportsScheduling: boolean;
    reportsExport: boolean;
    customDashboards: boolean;
    kpiTracking: boolean;
    goalTracking: boolean;
    benchmarkComparison: boolean;
    predictiveAnalytics: boolean;
    cohortAnalysis: boolean;
    lifetimeValue: boolean;
    attributionModeling: boolean;
    campaignPerformance: boolean;
    emailPerformance: boolean;
    socialPerformance: boolean;

    // ====== ADVANCED INTEGRATIONS (25 features) ======
    shopifyImport: boolean;
    walmartChannel: boolean;
    etsyChannel: boolean;
    amazonChannel: boolean;
    ebayChannel: boolean;
    bigCommerceImport: boolean;
    woocommerceImport: boolean;
    magentoImport: boolean;
    quickbooksDesktop: boolean;
    xero: boolean;
    freshbooks: boolean;
    zoho: boolean;
    hubspot: boolean;
    salesforce: boolean;
    mailchimp: boolean;
    klaviyo: boolean;
    activecampaign: boolean;
    convertkit: boolean;
    sendgrid: boolean;
    twilio: boolean;
    nexmo: boolean;
    stripeRadar: boolean;
    paypalVenmo: boolean;
    applePayGateway: boolean;
    googlePayGateway: boolean;

    // ====== ADVANCED SECURITY & PERFORMANCE (20 features) ======
    sslCertificate: boolean;
    ddosProtection: boolean;
    firewallProtection: boolean;
    malwareScanning: boolean;
    backupRestore: boolean;
    cdn: boolean;
    caching: boolean;
    imageOptimization: boolean;
    codeMinification: boolean;
    lazyLoading: boolean;
    pageSpeed: boolean;
    mobileOptimized: boolean;
    ampSupport: boolean;
    pwaSupport: boolean;
    http2Support: boolean;
    gzipCompression: boolean;
    databaseOptimization: boolean;
    queryOptimization: boolean;
    cdnGlobal: boolean;
    edgeComputing: boolean;

    // ====== ADVANCED MOBILE & CHANNEL (20 features) ======
    iosApp: boolean;
    androidApp: boolean;
    mobileSite: boolean;
    mobileCheckout: boolean;
    mobilePayment: boolean;
    appleWatch: boolean;
    tabletOptimized: boolean;
    desktopApp: boolean;
    windowsApp: boolean;
    macApp: boolean;
    posMobile: boolean;
    qrCodeCheckout: boolean;
    nfcCheckout: boolean;
    voiceCheckout: boolean;
    chatbotMobile: boolean;
    smsOrdering: boolean;
    whatsappBusiness: boolean;
    instagramShopping: boolean;
    facebookShop: boolean;
    tiktokShop: boolean;

    // ====== ADVANCED AUTOMATION (25 features) ======
    workflowBuilder: boolean;
    triggerActions: boolean;
    timeTriggers: boolean;
    eventTriggers: boolean;
    conditionTriggers: boolean;
    automationSequences: boolean;
    dripCampaigns: boolean;
    onboardingFlows: boolean;
    onboardingSequence: boolean;
    onboardingEmails: boolean;
    winBackFlow: boolean;
    reviewRequestFlow: boolean;
    shippingNotificationFlow: boolean;
    orderConfirmationFlow: boolean;
    refundFlow: boolean;
    supportEscalation: boolean;
    leadScoring: boolean;
    behaviorTriggers: boolean;
    segmentUpdate: boolean;
    tagUpdate: boolean;
    listManagement: boolean;
    unsubscribes: boolean;
    spamComplaints: boolean;
    bounces: boolean;
    deliveryTracking: boolean;

    // ====== ADVANCED DEVELOPER (25 features) ======
    webhooks: boolean;
    restApi: boolean;
    graphqlApi: boolean;
    sdk: boolean;
    mobileSdk: boolean;
    pluginFramework: boolean;
    themeEditor: boolean;
    codeAccess: boolean;
    customCss: boolean;
    customJs: boolean;
    customDomainNew: boolean;
    subdomain: boolean;
    cnameRecord: boolean;
    mxRecord: boolean;
    apiKeys: boolean;
    apiRateLimiting: boolean;
    apiLogging: boolean;
    webhooksDebug: boolean;
    sandboxMode: boolean;
    testMode: boolean;
    developerDocs: boolean;
    communityForum: boolean;
    featureRequest: boolean;
    bugTracker: boolean;
    betaAccess: boolean;

    // ====== ENTERPRISE FEATURES (50 features) ======
    multiTenant: boolean;
    whiteLabelComplete: boolean;
    dedicatedServer: boolean;
    customInfrastructure: boolean;
    slaGuarantee: boolean;
    dedicatedSupport: boolean;
    priorityQueue: boolean;
    customQuota: boolean;
    unlimitedBandwidth: boolean;
    enterpriseCdn: boolean;
    dedicatedIp: boolean;
    sslPremium: boolean;
    securityAudit: boolean;
    complianceReports: boolean;
    hipaaCompliance: boolean;
    soc2Compliance: boolean;
    pciDssCompliance: boolean;
    iso27001: boolean;
    enterpriseBackup: boolean;
    disasterRecovery: boolean;
    businessContinuity: boolean;
    uptimeGuarantee: boolean;
    loadBalancing: boolean;
    autoScaling: boolean;
    containerSupport: boolean;
    kubernetesSupport: boolean;
    microservices: boolean;
    apiGateway: boolean;
    serviceMesh: boolean;
    loggingAdvanced: boolean;
    monitoringAdvanced: boolean;
    alertingAdvanced: boolean;
    incidentManagement: boolean;
    changeManagement: boolean;
    releaseManagement: boolean;
    deploymentAutomation: boolean;
    ciCdAdvanced: boolean;
    codeReview: boolean;
    securityScanning: boolean;
    penetrationTesting: boolean;
    vulnerabilityManagement: boolean;
    patchManagement: boolean;
    configurationManagement: boolean;
    secretsManagement: boolean;
    identityManagement: boolean;
    samlSso: boolean;
    oauthProvider: boolean;
    ldapIntegration: boolean;
    activeDirectory: boolean;

    // ====== SOCIAL & COMMUNITY - E-COMMERCE RELEVANT (15 features) ======
    socialLogin: boolean;
    socialSharingNew: boolean;
    socialComments: boolean;
    socialRatings: boolean;
    socialReviews: boolean;
    messaging: boolean;
    notifications: boolean;
    activityFeed: boolean;
    userBadges: boolean;
    pointsSystem: boolean;
    leaderboards: boolean;
    testimonials: boolean;
    beforeAfter: boolean;
    comparisons: boolean;
    calculators: boolean;

    // ====== CONTENT & MEDIA - E-COMMERCE RELEVANT (15 features) ======
    cms: boolean;
    pageBuilder: boolean;
    blog: boolean;
    news: boolean;
    articles: boolean;
    mediaGallery: boolean;
    imageEditor: boolean;
    videoEditor: boolean;
    watermarking: boolean;
    cdnMedia: boolean;
    streaming: boolean;
    documentLibrary: boolean;
    fileManager: boolean;
    productVideos: boolean;
    product360View: boolean;

    // ====== NEW PREMIUM FEATURES (25 features) ======
    // Advanced Marketing (8)
    reTargetingAds: boolean;
    influencerMarketing: boolean;
    affiliateTracking: boolean;
    loyaltyPoints: boolean;
    rewardsProgram: boolean;

    // Advanced Store Features (9)
    backOrders: boolean;
    groupBuying: boolean;
    dailyDeals: boolean;
    seasonalDiscounts: boolean;

    // Advanced Customer (8)
    customerPortals: boolean;
    returnPortal: boolean;
    giftRegistries: boolean;
    storeCredit: boolean;
    priceMatch: boolean;
    priceAlert: boolean;

    // ====== FINANCIAL & ACCOUNTING - E-COMMERCE RELEVANT (20 features) ======
    doubleEntry: boolean;
    generalLedger: boolean;
    accountsPayable: boolean;
    accountsReceivable: boolean;
    invoicing: boolean;
    quotes: boolean;
    purchaseOrders: boolean;
    expenseTracking: boolean;
    budgetTracking: boolean;
    forecasting: boolean;
    cashFlow: boolean;
    profitLoss: boolean;
    balanceSheet: boolean;
    financialReports: boolean;
    taxPreparation: boolean;
    payroll: boolean;
    timeTracking: boolean;
    projectBilling: boolean;
    milestonePayments: boolean;

    // ====== DATA & ANALYTICS - E-COMMERCE RELEVANT (15 features) ======
    dataWarehouse: boolean;
    etl: boolean;
    dataPipeline: boolean;
    realTimeAnalytics: boolean;
    clickstream: boolean;
    userBehavior: boolean;
    heatmaps: boolean;
    funnels: boolean;
    cohorts: boolean;
    retention: boolean;
    churnAnalysis: boolean;
    lifetimeValueNew: boolean;
    rfmAnalysis: boolean;
    marketBasket: boolean;
    nextBestAction: boolean;

    // ====== COMMUNICATION - E-COMMERCE RELEVANT (15 features) ======
    videoConferencing: boolean;
    audioConferencing: boolean;
    screenSharingNew: boolean;
    fileSharing: boolean;
    documentCollaboration: boolean;
    recording: boolean;
    transcription: boolean;
    liveCaptioning: boolean;
    chat: boolean;
    directMessages: boolean;
    groupChat: boolean;
    channels: boolean;
    meetingScheduler: boolean;
    calendar: boolean;
    availability: boolean,

    // ====== PLATFORM OWNER / GLOBAL ADMIN DASHBOARD FEATURES (200 features) ======
    // ====== Platform Management (40 features) ======
    platformName: boolean;
    platformLogo: boolean;
    platformTheme: boolean;
    platformCurrency: boolean;
    platformLanguage: boolean;
    timezone: boolean;
    dateFormat: boolean;
    emailSettings: boolean;
    smtpSettings: boolean;
    emailTemplates: boolean;
    pushSettings: boolean;
    smsSettings: boolean;
    notificationSettings: boolean;
    maintenanceMode: boolean;
    platformStatus: boolean;
    platformVersion: boolean;
    platformUpdates: boolean;
    backupSettings: boolean;
    platformAnalytics: boolean;
    trafficAnalytics: boolean;
    userAnalytics: boolean;
    salesAnalytics: boolean;
    apiUsage: boolean;
    storageUsage: boolean;
    bandwidthUsage: boolean;
    platformHealth: boolean;
    serverStatus: boolean;
    databaseStatus: boolean;
    cacheStatus: boolean;
    queueStatus: boolean;
    schedulerStatus: boolean;
    platformLogs: boolean;
    errorLogs: boolean;
    accessLogs: boolean;
    auditLogsPlatform: boolean;
    platformSecurity: boolean;
    platformCompliance: boolean;
    dataRetention: boolean;
    privacyPolicyPlatform: boolean;
    termsOfService: boolean;
    cookiePolicy: boolean;

    // ====== Vendor Management (40 features) ======
    vendorApproval: boolean;
    vendorVerification: boolean;
    vendorKyc: boolean;
    vendorContracts: boolean;
    vendorOnboarding: boolean;
    vendorTraining: boolean;
    vendorSupport: boolean;
    vendorCommunication: boolean;
    vendorPerformance: boolean;
    vendorRating: boolean;
    vendorReviews: boolean;
    vendorDisputes: boolean;
    vendorPayments: boolean;
    vendorPayouts: boolean;
    vendorCommissions: boolean;
    vendorFees: boolean;
    vendorBilling: boolean;
    vendorInvoices: boolean;
    vendorReports: boolean;
    vendorAnalytics: boolean;
    vendorDashboard: boolean;
    vendorPortal: boolean;
    vendorApi: boolean;
    vendorWebhooks: boolean;
    vendorIntegrations: boolean;
    vendorPlugins: boolean;
    vendorThemes: boolean;
    vendorBranding: boolean;
    vendorCustomDomain: boolean;
    vendorSsl: boolean;
    vendorEmail: boolean;
    vendorSupportPortal: boolean;
    vendorTemplates: boolean;
    vendorMarketplace: boolean;
    vendorSeo: boolean;
    vendorAnalyticsDashboard: boolean;
    vendorTraffic: boolean;
    vendorConversions: boolean;
    vendorRevenue: boolean;

    // ====== Commission & Billing (30 features) ======
    commissionStructure: boolean;
    commissionTiers: boolean;
    commissionRules: boolean;
    commissionCalculation: boolean;
    commissionPayout: boolean;
    commissionHold: boolean;
    commissionTax: boolean;
    commissionReporting: boolean;
    platformRevenue: boolean;
    revenueShare: boolean;
    platformRevenueReports: boolean;
    billingCycle: boolean;
    invoiceGenerationPlatform: boolean;
    paymentProcessing: boolean;
    refundProcessing: boolean;
    chargebackHandling: boolean;
    disputeResolution: boolean;
    paymentGateway: boolean;
    paymentMethods: boolean;
    currencySupport: boolean;
    multiCurrencyPayment: boolean;
    currencyConversion: boolean;
    forexRates: boolean;
    paymentSecurity: boolean;
    pciCompliance: boolean;
    paymentAnalytics: boolean;
    transactionLogs: boolean;
    reconciliation: boolean;
    accounting: boolean;
    financialReportsPlatform: boolean;

    // ====== Marketplace Features (40 features) ======
    multiVendor: boolean;
    vendorStores: boolean;
    vendorProducts: boolean;
    vendorOrders: boolean;
    marketplaceSearch: boolean;
    marketplaceBrowse: boolean;
    categoryManagementPlatform: boolean;
    productCatalog: boolean;
    productApproval: boolean;
    productModeration: boolean;
    inventoryManagement: boolean;
    stockManagementPlatform: boolean;
    orderManagement: boolean;
    fulfillment: boolean;
    shippingIntegration: boolean;
    returnsManagement: boolean;
    exchangeManagement: boolean;
    refundManagement: boolean;
    warrantyManagement: boolean;
    productReviews: boolean;
    reviewModeration: boolean;
    ratingsManagement: boolean;
    questionsAnswers: boolean;
    customerSupport: boolean;
    liveChat: boolean;
    helpCenter: boolean;
    knowledgeBase: boolean;
    faqManagement: boolean;
    ticketSystem: boolean;
    escalation: boolean;
    abuseManagement: boolean;
    counterfeitDetection: boolean;
    intellectualProperty: boolean;
    brandProtection: boolean;
    contentModeration: boolean;
    searchOptimization: boolean;
    seoTools: boolean;
    marketingTools: boolean;
    advertising: boolean;

    // ====== Platform Analytics (25 features) ======
    realTimeAnalyticsPlatform: boolean;
    salesAnalyticsPlatform: boolean;
    revenueAnalytics: boolean;
    trafficAnalyticsPlatform: boolean;
    conversionAnalytics: boolean;
    userBehaviorAnalytics: boolean;
    vendorPerformanceMetrics: boolean;
    productPerformance: boolean;
    orderAnalytics: boolean;
    cartAnalytics: boolean;
    churnAnalytics: boolean;
    retentionAnalytics: boolean;
    cohortAnalysisPlatform: boolean;
    predictiveAnalyticsPlatform: boolean;
    marketTrends: boolean;
    competitiveAnalysis: boolean;
    customerInsights: boolean;
    segmentAnalysis: boolean;
    abTesting: boolean;
    funnelAnalysis: boolean;
    heatmapsPlatform: boolean;
    dashboards: boolean;
    customReportsPlatform: boolean;
    scheduledReports: boolean;
    dataExport: boolean;
    biIntegration: boolean;

    // ====== Platform Security (25 features) ======
    platformAuthentication: boolean;
    ssoIntegration: boolean;
    oauth: boolean;
    oauthProviderPlatform: boolean;
    ldapIntegrationPlatform: boolean;
    activeDirectoryPlatform: boolean;
    twoFactorAuthPlatform: boolean;
    biometricAuth: boolean;
    passwordPolicy: boolean;
    sessionManagementPlatform: boolean;
    ipWhitelist: boolean;
    geoBlocking: boolean;
    ddosProtectionPlatform: boolean;
    malwareProtection: boolean;
    vulnerabilityScanning: boolean;
    penetrationTestingPlatform: boolean;
    securityAudits: boolean;
    complianceReporting: boolean;
    gdprCompliancePlatform: boolean;
    ccpaCompliance: boolean;
    hipaaCompliancePlatform: boolean;
    pciDssCompliancePlatform: boolean;
    soc2CompliancePlatform: boolean;
    iso27001Compliance: boolean;
    dataEncryption: boolean;
}

export interface PlanDefinition {
    tier: PlanTier;
    label: string;
    monthlyPriceUsd: number;
    limits: {
        maxProducts: number;
        maxDiscountCodes: number;
        maxStaffMembers: number;
        aiRequestsPerDay: number;
    };
    features: FeatureFlags;
}

export const DEFAULT_PLAN_TIER: PlanTier = 'STARTER';

// Feature groups for organizing features by category
export const FEATURE_GROUPS = {
    marketingSales: {
        label: 'Marketing & Sales',
        features: [
            'bulkProductImport',
            'emailMarketing',
            'facebookPixel',
            'googleAnalytics',
            'discountAutomation',
            'loyaltyProgram',
            'flashSales',
            'pushNotifications'
        ] as const
    },
    storeManagement: {
        label: 'Store Management',
        features: [
            'multiLanguage',
            'posIntegration',
            'inventoryAlerts',
            'productVariants',
            'bundleProducts',
            'seasonalThemes'
        ] as const
    },
    advancedCommerce: {
        label: 'Advanced Commerce',
        features: [
            'membershipTiers',
            'giftCards',
            'bookingSystem',
            'waitlist',
            'preOrders',
            'wholesalePricing'
        ] as const
    },
    supportBranding: {
        label: 'Support & Branding',
        features: [
            'whiteLabelBranding',
            'apiAccess',
            'customReports',
            'advancedSegmentation',
            'auditLogs'
        ] as const
    },
    aiAdvanced: {
        label: 'AI Advanced',
        features: [
            'aiProductDescriptions',
            'aiSeoOptimization',
            'aiContentTranslation',
            'aiBlogWriting',
            'aiEmailDrafting',
            'aiAdCopy',
            'aiChatbot',
            'aiVoiceAssistant',
            'aiSentimentAnalysis',
            'aiAutoResponder',
            'aiTicketRouting',
            'aiSalesForecasting',
            'aiCustomerInsights',
            'aiChurnPrediction',
            'aiPriceOptimization',
            'aiTrendDetection',
            'aiImageGeneration',
            'aiImageEnhancement',
            'aiBackgroundRemoval',
            'aiVideoGeneration',
            'aiVirtualTryOn',
            'aiPersonalization',
            'aiAudienceSegmentation',
            'aiCampaignOptimizer',
            'aiAbTesting',
            // NEW AI Features (25)
            'aiDemandForecasting',
            'aiCustomerLifetimeValue',
            'aiPriceElasticity',
            'aiMarketBasketAnalysis',
            'aiCustomerSegmentation',
            'aiTrendPrediction',
            'aiCompetitorAnalysis',
            'aiPersonalizedRecommendations',
            'aiDynamicPricing',
            'aiSearchOptimization',
            'aiVisualSearch',
            'aiVoiceSearch',
            'aiChatbotAdvanced',
            'aiReviewSummarization',
            'aiProductComparison',
            'aiInventoryPrediction',
            'aiFraudDetection',
            'aiShippingOptimization',
            'aiReturnPrediction',
            'aiQualityControl',
            'aiSupplierManagement',
            'aiDemandPlanning',
            'aiAutoCataloging'
        ] as const
    },
    corePlatform: {
        label: 'Core Platform',
        features: [
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
        ] as const
    }
} as const;

// AI Feature groups for organizing AI features by category
export const AI_FEATURE_GROUPS = {
    aiContentGeneration: {
        label: 'AI Content Generation',
        description: 'AI-powered content creation tools',
        features: [
            'aiProductDescriptions',
            'aiSeoOptimization',
            'aiContentTranslation',
            'aiBlogWriting',
            'aiEmailDrafting',
            'aiAdCopy'
        ] as const
    },
    aiCustomerService: {
        label: 'AI Customer Service',
        description: 'AI-powered customer support tools',
        features: [
            'aiChatbot',
            'aiVoiceAssistant',
            'aiSentimentAnalysis',
            'aiAutoResponder',
            'aiTicketRouting'
        ] as const
    },
    aiAnalyticsInsights: {
        label: 'AI Analytics & Insights',
        description: 'AI-powered analytics and predictions',
        features: [
            'aiSalesForecasting',
            'aiCustomerInsights',
            'aiChurnPrediction',
            'aiPriceOptimization',
            'aiTrendDetection'
        ] as const
    },
    aiVisualMedia: {
        label: 'AI Visual & Media',
        description: 'AI-powered visual content creation',
        features: [
            'aiImageGeneration',
            'aiImageEnhancement',
            'aiBackgroundRemoval',
            'aiVideoGeneration',
            'aiVirtualTryOn'
        ] as const
    },
    aiMarketingAutomation: {
        label: 'AI Marketing & Automation',
        description: 'AI-powered marketing optimization',
        features: [
            'aiPersonalization',
            'aiAudienceSegmentation',
            'aiCampaignOptimizer',
            'aiAbTesting'
        ] as const
    },
    // NEW AI Feature Groups
    aiAdvancedAnalytics: {
        label: 'AI Advanced Analytics',
        description: 'AI-powered predictive analytics and insights',
        features: [
            'aiDemandForecasting',
            'aiCustomerLifetimeValue',
            'aiPriceElasticity',
            'aiMarketBasketAnalysis',
            'aiCustomerSegmentation',
            'aiTrendPrediction',
            'aiCompetitorAnalysis'
        ] as const
    },
    aiCustomerExperience: {
        label: 'AI Customer Experience',
        description: 'AI-powered customer engagement and personalization',
        features: [
            'aiPersonalizedRecommendations',
            'aiDynamicPricing',
            'aiSearchOptimization',
            'aiVisualSearch',
            'aiVoiceSearch',
            'aiChatbotAdvanced',
            'aiReviewSummarization',
            'aiProductComparison'
        ] as const
    },
    aiOperations: {
        label: 'AI Operations',
        description: 'AI-powered operational efficiency and automation',
        features: [
            'aiInventoryPrediction',
            'aiFraudDetection',
            'aiShippingOptimization',
            'aiReturnPrediction',
            'aiQualityControl',
            'aiSupplierManagement',
            'aiDemandPlanning',
            'aiAutoCataloging'
        ] as const
    }
} as const;

// Core Feature Groups - organizing core features by category
export const CORE_FEATURE_GROUPS = {
    paymentProcessing: {
        label: 'Payment Processing',
        description: 'Payment gateway integrations and options',
        features: [
            'paypalIntegration',
            'applePay',
            'googlePay',
            'buyNowPayLater',
            'multiCurrency'
        ] as const
    },
    shippingFulfillment: {
        label: 'Shipping & Fulfillment',
        description: 'Shipping carriers and fulfillment options',
        features: [
            'multipleCarriers',
            'shippingLabels',
            'shipmentTracking',
            'freeShipping',
            'localPickup'
        ] as const
    },
    taxCompliance: {
        label: 'Tax & Compliance',
        description: 'Tax calculation and compliance tools',
        features: [
            'automaticTax',
            'vatHandling',
            'taxReports'
        ] as const
    },
    orderManagement: {
        label: 'Order Management',
        description: 'Order processing and management tools',
        features: [
            'partialRefunds',
            'packingSlips',
            'orderExport',
            'returnManagement'
        ] as const
    },
    securityCompliance: {
        label: 'Security & Compliance',
        description: 'Security features and compliance tools',
        features: [
            'twoFactorAuth',
            'gdprCompliance',
            'sessionManagement'
        ] as const
    },
    thirdPartyIntegrations: {
        label: 'Third-party Integrations',
        description: 'External service integrations',
        features: [
            'quickbooksIntegration',
            'zendeskIntegration',
            'slackIntegration',
            'marketplaceAmazon',
            'marketplaceEbay'
        ] as const
    }
} as const;

// Advanced Feature Groups - organizing advanced features
export const ADVANCED_FEATURE_GROUPS = {
    advancedMarketing: {
        label: 'Advanced Marketing',
        description: 'Advanced marketing tools and automation',
        features: [
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
        ] as const
    },
    advancedStoreManagement: {
        label: 'Advanced Store Management',
        description: 'Advanced store operations and inventory management',
        features: [
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
        ] as const
    },
    advancedOrders: {
        label: 'Advanced Orders',
        description: 'Advanced order processing and management',
        features: [
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
        ] as const
    },
    advancedCustomers: {
        label: 'Advanced Customers',
        description: 'Advanced customer management and engagement',
        features: [
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
        ] as const
    },
    advancedAnalytics: {
        label: 'Advanced Analytics',
        description: 'Advanced analytics and reporting tools',
        features: [
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
        ] as const
    },
    advancedIntegrations: {
        label: 'Advanced Integrations',
        description: 'Third-party platform integrations',
        features: [
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
        ] as const
    },
    advancedSecurity: {
        label: 'Advanced Security & Performance',
        description: 'Security features and performance optimization',
        features: [
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
        ] as const
    },
    advancedMobile: {
        label: 'Advanced Mobile & Channel',
        description: 'Mobile apps and multi-channel selling',
        features: [
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
        ] as const
    },
    advancedAutomation: {
        label: 'Advanced Automation',
        description: 'Workflow automation and marketing automation',
        features: [
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
        ] as const
    },
    advancedDeveloper: {
        label: 'Advanced Developer',
        description: 'Developer tools and APIs',
        features: [
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
        ] as const
    }
} as const;

// Type for feature keys
export type FeatureKey = keyof FeatureFlags;

// Type for AI feature keys
export type AiFeatureKey =
    | 'aiProductDescriptions'
    | 'aiSeoOptimization'
    | 'aiContentTranslation'
    | 'aiBlogWriting'
    | 'aiEmailDrafting'
    | 'aiAdCopy'
    | 'aiChatbot'
    | 'aiVoiceAssistant'
    | 'aiSentimentAnalysis'
    | 'aiAutoResponder'
    | 'aiTicketRouting'
    | 'aiSalesForecasting'
    | 'aiCustomerInsights'
    | 'aiChurnPrediction'
    | 'aiPriceOptimization'
    | 'aiTrendDetection'
    | 'aiImageGeneration'
    | 'aiImageEnhancement'
    | 'aiBackgroundRemoval'
    | 'aiVideoGeneration'
    | 'aiVirtualTryOn'
    | 'aiPersonalization'
    | 'aiAudienceSegmentation'
    | 'aiCampaignOptimizer'
    | 'aiAbTesting'
    // NEW AI Features (25)
    | 'aiDemandForecasting'
    | 'aiCustomerLifetimeValue'
    | 'aiPriceElasticity'
    | 'aiMarketBasketAnalysis'
    | 'aiCustomerSegmentation'
    | 'aiTrendPrediction'
    | 'aiCompetitorAnalysis'
    | 'aiPersonalizedRecommendations'
    | 'aiDynamicPricing'
    | 'aiSearchOptimization'
    | 'aiVisualSearch'
    | 'aiVoiceSearch'
    | 'aiChatbotAdvanced'
    | 'aiReviewSummarization'
    | 'aiProductComparison'
    | 'aiInventoryPrediction'
    | 'aiFraudDetection'
    | 'aiShippingOptimization'
    | 'aiReturnPrediction'
    | 'aiQualityControl'
    | 'aiSupplierManagement'
    | 'aiDemandPlanning'
    | 'aiAutoCataloging';

// Type for core feature keys
export type CoreFeatureKey =
    // Payment Processing
    | 'paypalIntegration'
    | 'applePay'
    | 'googlePay'
    | 'buyNowPayLater'
    | 'multiCurrency'
    // Shipping & Fulfillment
    | 'multipleCarriers'
    | 'shippingLabels'
    | 'shipmentTracking'
    | 'freeShipping'
    | 'localPickup'
    // Tax & Compliance
    | 'automaticTax'
    | 'vatHandling'
    | 'taxReports'
    // Order Management
    | 'partialRefunds'
    | 'packingSlips'
    | 'orderExport'
    | 'returnManagement'
    // Security & Compliance
    | 'twoFactorAuth'
    | 'gdprCompliance'
    | 'sessionManagement'
    // Third-party Integrations
    | 'quickbooksIntegration'
    | 'zendeskIntegration'
    | 'slackIntegration'
    | 'marketplaceAmazon'
    | 'marketplaceEbay';

// Type for advanced feature keys
export type AdvancedFeatureKey =
    // Advanced Marketing (30 features)
    | 'smsMarketing'
    | 'affiliateProgram'
    | 'referralProgram'
    | 'popupBuilder'
    | 'countdownTimers'
    | 'socialSharing'
    | 'wishlistSharing'
    | 'productRecommendations'
    | 'relatedProducts'
    | 'recentlyViewed'
    | 'crossSelling'
    | 'upselling'
    | 'abandonedCheckoutRecovery'
    | 'postPurchaseUpsell'
    | 'checkoutAbandonment'
    | 'cartAbandonment'
    | 'dynamicPricing'
    | 'volumeDiscounts'
    | 'tieredPricing'
    | 'customerGroupPricing'
    | 'geoTargeting'
    | 'popUpNotifications'
    | 'announcementBars'
    | 'newsletterSignup'
    | 'leadCapture'
    | 'landingPageBuilder'
    | 'urlShortener'
    | 'qrCodeGenerator'
    | 'socialProof'
    | 'urgencyIndicators'
    // NEW Premium Features (15)
    | 'reTargetingAds'
    | 'influencerMarketing'
    | 'affiliateTracking'
    | 'loyaltyPoints'
    | 'rewardsProgram'
    | 'backOrders'
    | 'groupBuying'
    | 'dailyDeals'
    | 'seasonalDiscounts'
    | 'customerPortals'
    | 'returnPortal'
    | 'giftRegistries'
    | 'storeCredit'
    | 'priceMatch'
    | 'priceAlert'
    // Advanced Store Management (30 features)
    | 'stockManagement'
    | 'lowStockThreshold'
    | 'outOfStockManagement'
    | 'discontinuedProducts'
    | 'productTemplates'
    | 'categoryManagement'
    | 'attributeManagement'
    | 'brandManagement'
    | 'vendorManagement'
    | 'supplierManagement'
    | 'costTracking'
    | 'profitMarginCalculation'
    | 'barcodeGeneration'
    | 'skuGenerator'
    | 'upcEanGenerator'
    | 'productWeightDimensions'
    | 'shippingDimensions'
    | 'hsCodeClassification'
    | 'manufacturerInfo'
    | 'warrantyInfo'
    | 'returnPolicy'
    | 'refundPolicy'
    | 'shippingPolicy'
    | 'privacyPolicy'
    | 'termsConditions'
    | 'cookieConsent'
    | 'ageVerification'
    | 'productRating'
    | 'reviewManagement'
    | 'qaSection'
    // Advanced Orders (25 features)
    | 'orderStatuses'
    | 'orderNotes'
    | 'orderMessages'
    | 'orderAttachments'
    | 'orderHistory'
    | 'orderTimeline'
    | 'orderTracking'
    | 'orderWorkflows'
    | 'orderApproval'
    | 'orderHold'
    | 'orderCancel'
    | 'orderMerge'
    | 'orderSplit'
    | 'orderDuplicate'
    | 'invoiceGeneration'
    | 'creditMemos'
    | 'orderReminders'
    | 'backorderProcessing'
    | 'preOrderManagement'
    | 'subscriptionOrders'
    | 'recurringOrders'
    | 'wholesaleOrders'
    | 'bulkOrderProcessing'
    | 'orderImport'
    | 'orderSearch'
    | 'orderFiltering'
    // Advanced Customers (25 features)
    | 'customerRegistration'
    | 'customerLogin'
    | 'customerProfiles'
    | 'customerAddresses'
    | 'customerPhone'
    | 'customerNotes'
    | 'customerTags'
    | 'customerGroups'
    | 'customerSegments'
    | 'vipCustomers'
    | 'customerRanking'
    | 'customerBirthday'
    | 'customerAnniversary'
    | 'customerPreferences'
    | 'customerNotifications'
    | 'customerWishlist'
    | 'customerReviews'
    | 'customerReferrals'
    | 'customerLoyalty'
    | 'customerPoints'
    | 'customerRewards'
    | 'customerTierUpgrade'
    | 'customerDowngrade'
    | 'customerChurn'
    | 'customerReactivation'
    // Advanced Analytics (25 features)
    | 'salesReports'
    | 'revenueReports'
    | 'productReports'
    | 'categoryReports'
    | 'customerReports'
    | 'trafficReports'
    | 'conversionReports'
    | 'cartAbandonmentReports'
    | 'sourceReports'
    | 'utmReports'
    | 'deviceReports'
    | 'locationReports'
    | 'reportsScheduling'
    | 'reportsExport'
    | 'customDashboards'
    | 'kpiTracking'
    | 'goalTracking'
    | 'benchmarkComparison'
    | 'predictiveAnalytics'
    | 'cohortAnalysis'
    | 'lifetimeValue'
    | 'attributionModeling'
    | 'campaignPerformance'
    | 'emailPerformance'
    | 'socialPerformance'
    // Advanced Integrations (25 features)
    | 'shopifyImport'
    | 'walmartChannel'
    | 'etsyChannel'
    | 'amazonChannel'
    | 'ebayChannel'
    | 'bigCommerceImport'
    | 'woocommerceImport'
    | 'magentoImport'
    | 'quickbooksDesktop'
    | 'xero'
    | 'freshbooks'
    | 'zoho'
    | 'hubspot'
    | 'salesforce'
    | 'mailchimp'
    | 'klaviyo'
    | 'activecampaign'
    | 'convertkit'
    | 'sendgrid'
    | 'twilio'
    | 'nexmo'
    | 'stripeRadar'
    | 'paypalVenmo'
    | 'applePayGateway'
    | 'googlePayGateway'
    // Advanced Security & Performance (20 features)
    | 'sslCertificate'
    | 'ddosProtection'
    | 'firewallProtection'
    | 'malwareScanning'
    | 'backupRestore'
    | 'cdn'
    | 'caching'
    | 'imageOptimization'
    | 'codeMinification'
    | 'lazyLoading'
    | 'pageSpeed'
    | 'mobileOptimized'
    | 'ampSupport'
    | 'pwaSupport'
    | 'http2Support'
    | 'gzipCompression'
    | 'databaseOptimization'
    | 'queryOptimization'
    | 'cdnGlobal'
    | 'edgeComputing'
    // Advanced Mobile & Channel (20 features)
    | 'iosApp'
    | 'androidApp'
    | 'mobileSite'
    | 'mobileCheckout'
    | 'mobilePayment'
    | 'appleWatch'
    | 'tabletOptimized'
    | 'desktopApp'
    | 'windowsApp'
    | 'macApp'
    | 'posMobile'
    | 'qrCodeCheckout'
    | 'nfcCheckout'
    | 'voiceCheckout'
    | 'chatbotMobile'
    | 'smsOrdering'
    | 'whatsappBusiness'
    | 'instagramShopping'
    | 'facebookShop'
    | 'tiktokShop'
    // Advanced Automation (25 features)
    | 'workflowBuilder'
    | 'triggerActions'
    | 'timeTriggers'
    | 'eventTriggers'
    | 'conditionTriggers'
    | 'automationSequences'
    | 'dripCampaigns'
    | 'onboardingFlows'
    | 'onboardingSequence'
    | 'onboardingEmails'
    | 'winBackFlow'
    | 'reviewRequestFlow'
    | 'shippingNotificationFlow'
    | 'orderConfirmationFlow'
    | 'refundFlow'
    | 'supportEscalation'
    | 'leadScoring'
    | 'behaviorTriggers'
    | 'segmentUpdate'
    | 'tagUpdate'
    | 'listManagement'
    | 'unsubscribes'
    | 'spamComplaints'
    | 'bounces'
    | 'deliveryTracking'
    // Advanced Developer (25 features)
    | 'webhooks'
    | 'restApi'
    | 'graphqlApi'
    | 'sdk'
    | 'mobileSdk'
    | 'pluginFramework'
    | 'themeEditor'
    | 'codeAccess'
    | 'customCss'
    | 'customJs'
    | 'customDomainNew'
    | 'subdomain'
    | 'cnameRecord'
    | 'mxRecord'
    | 'apiKeys'
    | 'apiRateLimiting'
    | 'apiLogging'
    | 'webhooksDebug'
    | 'sandboxMode'
    | 'testMode'
    | 'developerDocs'
    | 'communityForum'
    | 'featureRequest'
    | 'bugTracker'
    | 'betaAccess';

// Helper function to check if a feature is available for a given plan
export const getFeatureForPlan = (tier: PlanTier, feature: FeatureKey): boolean => {
    const plan = PLATFORM_PLANS[tier];
    return plan.features[feature];
};

// Get all features available for a plan
export const getFeaturesForPlan = (tier: PlanTier): FeatureFlags => {
    return PLATFORM_PLANS[tier].features;
};

// Check if a plan has all features in a group
export const hasFeatureGroup = (tier: PlanTier, group: keyof typeof FEATURE_GROUPS): boolean => {
    const groupFeatures = FEATURE_GROUPS[group].features;
    return groupFeatures.every(feature => getFeatureForPlan(tier, feature));
};

// Helper function to check if an AI feature is available for a given plan
export const getAiFeatureForPlan = (tier: PlanTier, feature: AiFeatureKey): boolean => {
    const plan = PLATFORM_PLANS[tier];
    return plan.features[feature];
};

// Get all AI features available for a plan
export const getAiFeaturesForPlan = (tier: PlanTier): Pick<FeatureFlags, AiFeatureKey> => {
    const allFeatures = PLATFORM_PLANS[tier].features;
    const aiFeatures: Record<string, boolean> = {};

    const aiFeatureKeys: AiFeatureKey[] = [
        'aiProductDescriptions',
        'aiSeoOptimization',
        'aiContentTranslation',
        'aiBlogWriting',
        'aiEmailDrafting',
        'aiAdCopy',
        'aiChatbot',
        'aiVoiceAssistant',
        'aiSentimentAnalysis',
        'aiAutoResponder',
        'aiTicketRouting',
        'aiSalesForecasting',
        'aiCustomerInsights',
        'aiChurnPrediction',
        'aiPriceOptimization',
        'aiTrendDetection',
        'aiImageGeneration',
        'aiImageEnhancement',
        'aiBackgroundRemoval',
        'aiVideoGeneration',
        'aiVirtualTryOn',
        'aiPersonalization',
        'aiAudienceSegmentation',
        'aiCampaignOptimizer',
        'aiAbTesting',
        // NEW AI Features (25)
        'aiDemandForecasting',
        'aiCustomerLifetimeValue',
        'aiPriceElasticity',
        'aiMarketBasketAnalysis',
        'aiCustomerSegmentation',
        'aiTrendPrediction',
        'aiCompetitorAnalysis',
        'aiPersonalizedRecommendations',
        'aiDynamicPricing',
        'aiSearchOptimization',
        'aiVisualSearch',
        'aiVoiceSearch',
        'aiChatbotAdvanced',
        'aiReviewSummarization',
        'aiProductComparison',
        'aiInventoryPrediction',
        'aiFraudDetection',
        'aiShippingOptimization',
        'aiReturnPrediction',
        'aiQualityControl',
        'aiSupplierManagement',
        'aiDemandPlanning',
        'aiAutoCataloging'
    ];

    for (const key of aiFeatureKeys) {
        aiFeatures[key] = allFeatures[key];
    }

    return aiFeatures as Pick<FeatureFlags, AiFeatureKey>;
};

// Check if a plan has all AI features in a group
export const hasAiFeatureGroup = (tier: PlanTier, group: keyof typeof AI_FEATURE_GROUPS): boolean => {
    const groupFeatures = AI_FEATURE_GROUPS[group].features;
    return groupFeatures.every(feature => getAiFeatureForPlan(tier, feature));
};

// Helper function to check if a core feature is available for a given plan
export const getCoreFeatureForPlan = (tier: PlanTier, feature: CoreFeatureKey): boolean => {
    const plan = PLATFORM_PLANS[tier];
    return plan.features[feature];
};

// Get all core features available for a plan
export const getCoreFeaturesForPlan = (tier: PlanTier): Pick<FeatureFlags, CoreFeatureKey> => {
    const allFeatures = PLATFORM_PLANS[tier].features;
    const coreFeatures: Record<string, boolean> = {};

    const coreFeatureKeys: CoreFeatureKey[] = [
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

    for (const key of coreFeatureKeys) {
        coreFeatures[key] = allFeatures[key];
    }

    return coreFeatures as Pick<FeatureFlags, CoreFeatureKey>;
};

// Check if a plan has all core features in a group
export const hasCoreFeatureGroup = (tier: PlanTier, group: keyof typeof CORE_FEATURE_GROUPS): boolean => {
    const groupFeatures = CORE_FEATURE_GROUPS[group].features;
    return groupFeatures.every(feature => getCoreFeatureForPlan(tier, feature));
};

// Helper function to check if an advanced feature is available for a given plan
export const getAdvancedFeatureForPlan = (tier: PlanTier, feature: AdvancedFeatureKey): boolean => {
    const plan = PLATFORM_PLANS[tier];
    return plan.features[feature];
};

// Get all advanced features available for a plan
export const getAdvancedFeaturesForPlan = (tier: PlanTier): Pick<FeatureFlags, AdvancedFeatureKey> => {
    const allFeatures = PLATFORM_PLANS[tier].features;
    const advancedFeatures: Record<string, boolean> = {};

    const advancedFeatureKeys: AdvancedFeatureKey[] = [
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
        // NEW Premium Features (15)
        'reTargetingAds',
        'influencerMarketing',
        'affiliateTracking',
        'loyaltyPoints',
        'rewardsProgram',
        'backOrders',
        'groupBuying',
        'dailyDeals',
        'seasonalDiscounts',
        'customerPortals',
        'returnPortal',
        'giftRegistries',
        'storeCredit',
        'priceMatch',
        'priceAlert',
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

    for (const key of advancedFeatureKeys) {
        advancedFeatures[key] = allFeatures[key];
    }

    return advancedFeatures as Pick<FeatureFlags, AdvancedFeatureKey>;
};

// Check if a plan has all advanced features in a group
export const hasAdvancedFeatureGroup = (tier: PlanTier, group: keyof typeof ADVANCED_FEATURE_GROUPS): boolean => {
    const groupFeatures = ADVANCED_FEATURE_GROUPS[group].features;
    return groupFeatures.every(feature => getAdvancedFeatureForPlan(tier, feature));
};

// PLATFORM_PLANS with e-commerce features (~280 features)
export const PLATFORM_PLANS: Record<PlanTier, PlanDefinition> = {
    STARTER: {
        tier: 'STARTER',
        label: 'Starter (Free)',
        monthlyPriceUsd: 0,
        limits: {
            maxProducts: 200,
            maxDiscountCodes: 10,
            maxStaffMembers: 2,
            aiRequestsPerDay: 50
        },
        features: {
            // Original Core Features (25) - all false for STARTER
            advancedAnalytics: false,
            prioritySupport: false,
            customDomain: false,
            abandonedCartRecovery: false,
            bulkProductImport: false,
            emailMarketing: false,
            facebookPixel: false,
            googleAnalytics: false,
            discountAutomation: false,
            loyaltyProgram: false,
            flashSales: false,
            pushNotifications: false,
            multiLanguage: false,
            posIntegration: false,
            inventoryAlerts: false,
            productVariants: false,
            bundleProducts: false,
            seasonalThemes: false,
            membershipTiers: false,
            giftCards: false,
            bookingSystem: false,
            waitlist: false,
            preOrders: false,
            wholesalePricing: false,
            whiteLabelBranding: false,
            apiAccess: false,
            customReports: false,
            advancedSegmentation: false,
            auditLogs: false,

            // AI Features (20) - all false for STARTER
            aiProductDescriptions: false,
            aiSeoOptimization: false,
            aiContentTranslation: false,
            aiBlogWriting: false,
            aiEmailDrafting: false,
            aiAdCopy: false,
            aiChatbot: false,
            aiVoiceAssistant: false,
            aiSentimentAnalysis: false,
            aiAutoResponder: false,
            aiTicketRouting: false,
            aiSalesForecasting: false,
            aiCustomerInsights: false,
            aiChurnPrediction: false,
            aiPriceOptimization: false,
            aiTrendDetection: false,
            aiImageGeneration: false,
            aiImageEnhancement: false,
            aiBackgroundRemoval: false,
            aiVideoGeneration: false,
            aiVirtualTryOn: false,
            aiPersonalization: false,
            aiAudienceSegmentation: false,
            aiCampaignOptimizer: false,
            aiAbTesting: false,

            // NEW AI Features (25) - all false for STARTER
            aiDemandForecasting: false,
            aiCustomerLifetimeValue: false,
            aiPriceElasticity: false,
            aiMarketBasketAnalysis: false,
            aiCustomerSegmentation: false,
            aiTrendPrediction: false,
            aiCompetitorAnalysis: false,
            aiPersonalizedRecommendations: false,
            aiDynamicPricing: false,
            aiSearchOptimization: false,
            aiVisualSearch: false,
            aiVoiceSearch: false,
            aiChatbotAdvanced: false,
            aiReviewSummarization: false,
            aiProductComparison: false,
            aiInventoryPrediction: false,
            aiFraudDetection: false,
            aiShippingOptimization: false,
            aiReturnPrediction: false,
            aiQualityControl: false,
            aiSupplierManagement: false,
            aiDemandPlanning: false,
            aiAutoCataloging: false,

            // Auto Pilot Core (20 features) - All false for STARTER
            autoPilotEnabled: false,
            aiDashboard: false,
            smartSuggestions: false,
            automatedDecisions: false,
            predictiveInsights: false,
            anomalyDetection: false,
            anomalyAlerts: false,
            smartNotifications: false,
            dailyBriefing: false,
            weeklyReport: false,
            trendAnalysis: false,
            opportunityDetection: false,
            riskAssessment: false,
            recommendationEngine: false,
            naturalLanguageQueries: false,
            aiVoiceCommands: false,
            smartSearch: false,
            contextualHelp: false,
            automatedOnboarding: false,
            smartTutorial: false,

            // Seller Auto Pilot (25 features) - All false for STARTER
            autoInventoryManagement: false,
            autoPricing: false,
            autoReorder: false,
            autoProductListings: false,
            autoSeo: false,
            autoAdSpend: false,
            autoEmailMarketing: false,
            autoSocialPosting: false,
            autoCustomerResponse: false,
            autoReviewResponse: false,
            autoOrderProcessing: false,
            autoRefund: false,
            autoCustomerSupport: false,
            autoAnalytics: false,
            autoCompetitorAnalysis: false,
            autoTrendProducts: false,
            autoPricingStrategy: false,
            autoInventoryAlerts: false,
            autoAbandonedCart: false,
            autoLoyaltyProgram: false,
            autoUpselling: false,
            autoCrossSelling: false,
            autoDiscounts: false,
            autoFlashSales: false,
            autoSeasonalCampaigns: false,

            // Platform Owner Auto Pilot (25 features) - All false for STARTER
            autoVendorApproval: false,
            autoVendorMonitoring: false,
            autoFraudDetection: false,
            autoDisputeResolution: false,
            autoCompliance: false,
            autoRevenueOptimization: false,
            autoCommission: false,
            autoPlatformAnalytics: false,
            autoMarketInsights: false,
            autoTrendIdentification: false,
            autoUserBehavior: false,
            autoChurnPrediction: false,
            autoGrowthHacking: false,
            autoCampaignManagement: false,
            autoPartnerManagement: false,
            autoSupportRouting: false,
            autoContentModeration: false,
            autoPricingBenchmarking: false,
            autoCompetitiveIntelligence: false,
            autoRiskManagement: false,
            autoResourceScaling: false,
            autoSecurityMonitoring: false,
            autoPerformance: false,
            autoBackup: false,
            autoComplianceReports: false,

            // Core Platform Features (25) - all false for STARTER
            paypalIntegration: false,
            applePay: false,
            googlePay: false,
            buyNowPayLater: false,
            multiCurrency: false,
            multipleCarriers: false,
            shippingLabels: false,
            shipmentTracking: false,
            freeShipping: false,
            localPickup: false,
            automaticTax: false,
            vatHandling: false,
            taxReports: false,
            partialRefunds: false,
            packingSlips: false,
            orderExport: false,
            returnManagement: false,
            twoFactorAuth: false,
            gdprCompliance: false,
            sessionManagement: false,
            quickbooksIntegration: false,
            zendeskIntegration: false,
            slackIntegration: false,
            marketplaceAmazon: false,
            marketplaceEbay: false,

            // Advanced Marketing (30) - all false
            smsMarketing: false,
            affiliateProgram: false,
            referralProgram: false,
            popupBuilder: false,
            countdownTimers: false,
            socialSharing: false,
            wishlistSharing: false,
            productRecommendations: false,
            relatedProducts: false,
            recentlyViewed: false,
            crossSelling: false,
            upselling: false,
            abandonedCheckoutRecovery: false,
            postPurchaseUpsell: false,
            checkoutAbandonment: false,
            cartAbandonment: false,
            dynamicPricing: false,
            volumeDiscounts: false,
            tieredPricing: false,
            customerGroupPricing: false,
            geoTargeting: false,
            popUpNotifications: false,
            announcementBars: false,
            newsletterSignup: false,
            leadCapture: false,
            landingPageBuilder: false,
            urlShortener: false,
            qrCodeGenerator: false,
            socialProof: false,
            urgencyIndicators: false,

            // Advanced Store Management (30) - all false
            stockManagement: false,
            lowStockThreshold: false,
            outOfStockManagement: false,
            discontinuedProducts: false,
            productTemplates: false,
            categoryManagement: false,
            attributeManagement: false,
            brandManagement: false,
            vendorManagement: false,
            supplierManagement: false,
            costTracking: false,
            profitMarginCalculation: false,
            barcodeGeneration: false,
            skuGenerator: false,
            upcEanGenerator: false,
            productWeightDimensions: false,
            shippingDimensions: false,
            hsCodeClassification: false,
            manufacturerInfo: false,
            warrantyInfo: false,
            returnPolicy: false,
            refundPolicy: false,
            shippingPolicy: false,
            privacyPolicy: false,
            termsConditions: false,
            cookieConsent: false,
            ageVerification: false,
            productRating: false,
            reviewManagement: false,
            qaSection: false,

            // Advanced Orders (25) - all false
            orderStatuses: false,
            orderNotes: false,
            orderMessages: false,
            orderAttachments: false,
            orderHistory: false,
            orderTimeline: false,
            orderTracking: false,
            orderWorkflows: false,
            orderApproval: false,
            orderHold: false,
            orderCancel: false,
            orderMerge: false,
            orderSplit: false,
            orderDuplicate: false,
            invoiceGeneration: false,
            creditMemos: false,
            orderReminders: false,
            backorderProcessing: false,
            preOrderManagement: false,
            subscriptionOrders: false,
            recurringOrders: false,
            wholesaleOrders: false,
            bulkOrderProcessing: false,
            orderImport: false,
            orderSearch: false,
            orderFiltering: false,

            // Advanced Customers (25) - all false
            customerRegistration: false,
            customerLogin: false,
            customerProfiles: false,
            customerAddresses: false,
            customerPhone: false,
            customerNotes: false,
            customerTags: false,
            customerGroups: false,
            customerSegments: false,
            vipCustomers: false,
            customerRanking: false,
            customerBirthday: false,
            customerAnniversary: false,
            customerPreferences: false,
            customerNotifications: false,
            customerWishlist: false,
            customerReviews: false,
            customerReferrals: false,
            customerLoyalty: false,
            customerPoints: false,
            customerRewards: false,
            customerTierUpgrade: false,
            customerDowngrade: false,
            customerChurn: false,
            customerReactivation: false,

            // Advanced Analytics (25) - all false
            salesReports: false,
            revenueReports: false,
            productReports: false,
            categoryReports: false,
            customerReports: false,
            trafficReports: false,
            conversionReports: false,
            cartAbandonmentReports: false,
            sourceReports: false,
            utmReports: false,
            deviceReports: false,
            locationReports: false,
            reportsScheduling: false,
            reportsExport: false,
            customDashboards: false,
            kpiTracking: false,
            goalTracking: false,
            benchmarkComparison: false,
            predictiveAnalytics: false,
            cohortAnalysis: false,
            lifetimeValue: false,
            attributionModeling: false,
            campaignPerformance: false,
            emailPerformance: false,
            socialPerformance: false,

            // Advanced Integrations (25) - all false
            shopifyImport: false,
            walmartChannel: false,
            etsyChannel: false,
            amazonChannel: false,
            ebayChannel: false,
            bigCommerceImport: false,
            woocommerceImport: false,
            magentoImport: false,
            quickbooksDesktop: false,
            xero: false,
            freshbooks: false,
            zoho: false,
            hubspot: false,
            salesforce: false,
            mailchimp: false,
            klaviyo: false,
            activecampaign: false,
            convertkit: false,
            sendgrid: false,
            twilio: false,
            nexmo: false,
            stripeRadar: false,
            paypalVenmo: false,
            applePayGateway: false,
            googlePayGateway: false,

            // Advanced Security & Performance (20) - all false
            sslCertificate: false,
            ddosProtection: false,
            firewallProtection: false,
            malwareScanning: false,
            backupRestore: false,
            cdn: false,
            caching: false,
            imageOptimization: false,
            codeMinification: false,
            lazyLoading: false,
            pageSpeed: false,
            mobileOptimized: false,
            ampSupport: false,
            pwaSupport: false,
            http2Support: false,
            gzipCompression: false,
            databaseOptimization: false,
            queryOptimization: false,
            cdnGlobal: false,
            edgeComputing: false,

            // Advanced Mobile & Channel (20) - all false
            iosApp: false,
            androidApp: false,
            mobileSite: false,
            mobileCheckout: false,
            mobilePayment: false,
            appleWatch: false,
            tabletOptimized: false,
            desktopApp: false,
            windowsApp: false,
            macApp: false,
            posMobile: false,
            qrCodeCheckout: false,
            nfcCheckout: false,
            voiceCheckout: false,
            chatbotMobile: false,
            smsOrdering: false,
            whatsappBusiness: false,
            instagramShopping: false,
            facebookShop: false,
            tiktokShop: false,

            // Advanced Automation (25) - all false
            workflowBuilder: false,
            triggerActions: false,
            timeTriggers: false,
            eventTriggers: false,
            conditionTriggers: false,
            automationSequences: false,
            dripCampaigns: false,
            onboardingFlows: false,
            onboardingSequence: false,
            onboardingEmails: false,
            winBackFlow: false,
            reviewRequestFlow: false,
            shippingNotificationFlow: false,
            orderConfirmationFlow: false,
            refundFlow: false,
            supportEscalation: false,
            leadScoring: false,
            behaviorTriggers: false,
            segmentUpdate: false,
            tagUpdate: false,
            listManagement: false,
            unsubscribes: false,
            spamComplaints: false,
            bounces: false,
            deliveryTracking: false,

            // Advanced Developer (25) - all false
            webhooks: false,
            restApi: false,
            graphqlApi: false,
            sdk: false,
            mobileSdk: false,
            pluginFramework: false,
            themeEditor: false,
            codeAccess: false,
            customCss: false,
            customJs: false,
            customDomainNew: false,
            subdomain: false,
            cnameRecord: false,
            mxRecord: false,
            apiKeys: false,
            apiRateLimiting: false,
            apiLogging: false,
            webhooksDebug: false,
            sandboxMode: false,
            testMode: false,
            developerDocs: false,
            communityForum: false,
            featureRequest: false,
            bugTracker: false,
            betaAccess: false,

            // Enterprise Features (50) - all false
            multiTenant: false,
            whiteLabelComplete: false,
            dedicatedServer: false,
            customInfrastructure: false,
            slaGuarantee: false,
            dedicatedSupport: false,
            priorityQueue: false,
            customQuota: false,
            unlimitedBandwidth: false,
            enterpriseCdn: false,
            dedicatedIp: false,
            sslPremium: false,
            securityAudit: false,
            complianceReports: false,
            hipaaCompliance: false,
            soc2Compliance: false,
            pciDssCompliance: false,
            iso27001: false,
            enterpriseBackup: false,
            disasterRecovery: false,
            businessContinuity: false,
            uptimeGuarantee: false,
            loadBalancing: false,
            autoScaling: false,
            containerSupport: false,
            kubernetesSupport: false,
            microservices: false,
            apiGateway: false,
            serviceMesh: false,
            loggingAdvanced: false,
            monitoringAdvanced: false,
            alertingAdvanced: false,
            incidentManagement: false,
            changeManagement: false,
            releaseManagement: false,
            deploymentAutomation: false,
            ciCdAdvanced: false,
            codeReview: false,
            securityScanning: false,
            penetrationTesting: false,
            vulnerabilityManagement: false,
            patchManagement: false,
            configurationManagement: false,
            secretsManagement: false,
            identityManagement: false,
            samlSso: false,
            oauthProvider: false,
            ldapIntegration: false,
            activeDirectory: false,

            // Social & Community (15) - all false
            socialLogin: false,
            socialSharingNew: false,
            socialComments: false,
            socialRatings: false,
            socialReviews: false,
            messaging: false,
            notifications: false,
            activityFeed: false,
            userBadges: false,
            pointsSystem: false,
            leaderboards: false,
            testimonials: false,
            beforeAfter: false,
            comparisons: false,
            calculators: false,

            // Content & Media (15) - all false
            cms: false,
            pageBuilder: false,
            blog: false,
            news: false,
            articles: false,
            mediaGallery: false,
            imageEditor: false,
            videoEditor: false,
            watermarking: false,
            cdnMedia: false,
            streaming: false,
            documentLibrary: false,
            fileManager: false,
            productVideos: false,
            product360View: false,

            // Financial (20) - all false
            doubleEntry: false,
            generalLedger: false,
            accountsPayable: false,
            accountsReceivable: false,
            invoicing: false,
            quotes: false,
            purchaseOrders: false,
            expenseTracking: false,
            budgetTracking: false,
            forecasting: false,
            cashFlow: false,
            profitLoss: false,
            balanceSheet: false,
            financialReports: false,
            taxPreparation: false,
            payroll: false,
            timeTracking: false,
            projectBilling: false,
            milestonePayments: false,

            // Data & Analytics (15) - all false
            dataWarehouse: false,
            etl: false,
            dataPipeline: false,
            realTimeAnalytics: false,
            clickstream: false,
            userBehavior: false,
            heatmaps: false,
            funnels: false,
            cohorts: false,
            retention: false,
            churnAnalysis: false,
            lifetimeValueNew: false,
            rfmAnalysis: false,
            marketBasket: false,
            nextBestAction: false,

            // Communication (15) - all false
            videoConferencing: false,
            audioConferencing: false,
            screenSharingNew: false,
            fileSharing: false,
            documentCollaboration: false,
            recording: false,
            transcription: false,
            liveCaptioning: false,
            chat: false,
            directMessages: false,
            groupChat: false,
            channels: false,
            meetingScheduler: false,
            calendar: false,
            availability: false,

            // NEW PREMIUM FEATURES (25) - all false for STARTER
            // Advanced Marketing (5 new)
            reTargetingAds: false,
            influencerMarketing: false,
            affiliateTracking: false,
            loyaltyPoints: false,
            rewardsProgram: false,

            // Advanced Store Features (4 new)
            backOrders: false,
            groupBuying: false,
            dailyDeals: false,
            seasonalDiscounts: false,

            // Advanced Customer (6 new)
            customerPortals: false,
            returnPortal: false,
            giftRegistries: false,
            storeCredit: false,
            priceMatch: false,
            priceAlert: false,

            // Platform Owner / Global Admin Dashboard Features (200 features) - All false for STARTER
            platformName: false,
            platformLogo: false,
            platformTheme: false,
            platformCurrency: false,
            platformLanguage: false,
            timezone: false,
            dateFormat: false,
            emailSettings: false,
            smtpSettings: false,
            emailTemplates: false,
            pushSettings: false,
            smsSettings: false,
            notificationSettings: false,
            maintenanceMode: false,
            platformStatus: false,
            platformVersion: false,
            platformUpdates: false,
            backupSettings: false,
            platformAnalytics: false,
            trafficAnalytics: false,
            userAnalytics: false,
            salesAnalytics: false,
            apiUsage: false,
            storageUsage: false,
            bandwidthUsage: false,
            platformHealth: false,
            serverStatus: false,
            databaseStatus: false,
            cacheStatus: false,
            queueStatus: false,
            schedulerStatus: false,
            platformLogs: false,
            errorLogs: false,
            accessLogs: false,
            auditLogsPlatform: false,
            platformSecurity: false,
            platformCompliance: false,
            dataRetention: false,
            privacyPolicyPlatform: false,
            termsOfService: false,
            cookiePolicy: false,
            vendorApproval: false,
            vendorVerification: false,
            vendorKyc: false,
            vendorContracts: false,
            vendorOnboarding: false,
            vendorTraining: false,
            vendorSupport: false,
            vendorCommunication: false,
            vendorPerformance: false,
            vendorRating: false,
            vendorReviews: false,
            vendorDisputes: false,
            vendorPayments: false,
            vendorPayouts: false,
            vendorCommissions: false,
            vendorFees: false,
            vendorBilling: false,
            vendorInvoices: false,
            vendorReports: false,
            vendorAnalytics: false,
            vendorDashboard: false,
            vendorPortal: false,
            vendorApi: false,
            vendorWebhooks: false,
            vendorIntegrations: false,
            vendorPlugins: false,
            vendorThemes: false,
            vendorBranding: false,
            vendorCustomDomain: false,
            vendorSsl: false,
            vendorEmail: false,
            vendorSupportPortal: false,
            vendorTemplates: false,
            vendorMarketplace: false,
            vendorSeo: false,
            vendorAnalyticsDashboard: false,
            vendorTraffic: false,
            vendorConversions: false,
            vendorRevenue: false,
            commissionStructure: false,
            commissionTiers: false,
            commissionRules: false,
            commissionCalculation: false,
            commissionPayout: false,
            commissionHold: false,
            commissionTax: false,
            commissionReporting: false,
            platformRevenue: false,
            revenueShare: false,
            platformRevenueReports: false,
            billingCycle: false,
            invoiceGenerationPlatform: false,
            paymentProcessing: false,
            refundProcessing: false,
            chargebackHandling: false,
            disputeResolution: false,
            paymentGateway: false,
            paymentMethods: false,
            currencySupport: false,
            multiCurrencyPayment: false,
            currencyConversion: false,
            forexRates: false,
            paymentSecurity: false,
            pciCompliance: false,
            paymentAnalytics: false,
            transactionLogs: false,
            reconciliation: false,
            accounting: false,
            financialReportsPlatform: false,
            multiVendor: false,
            vendorStores: false,
            vendorProducts: false,
            vendorOrders: false,
            marketplaceSearch: false,
            marketplaceBrowse: false,
            categoryManagementPlatform: false,
            productCatalog: false,
            productApproval: false,
            productModeration: false,
            inventoryManagement: false,
            stockManagementPlatform: false,
            orderManagement: false,
            fulfillment: false,
            shippingIntegration: false,
            returnsManagement: false,
            exchangeManagement: false,
            refundManagement: false,
            warrantyManagement: false,
            productReviews: false,
            reviewModeration: false,
            ratingsManagement: false,
            questionsAnswers: false,
            customerSupport: false,
            liveChat: false,
            helpCenter: false,
            knowledgeBase: false,
            faqManagement: false,
            ticketSystem: false,
            escalation: false,
            abuseManagement: false,
            counterfeitDetection: false,
            intellectualProperty: false,
            brandProtection: false,
            contentModeration: false,
            searchOptimization: false,
            seoTools: false,
            marketingTools: false,
            advertising: false,
            realTimeAnalyticsPlatform: false,
            salesAnalyticsPlatform: false,
            revenueAnalytics: false,
            trafficAnalyticsPlatform: false,
            conversionAnalytics: false,
            userBehaviorAnalytics: false,
            vendorPerformanceMetrics: false,
            productPerformance: false,
            orderAnalytics: false,
            cartAnalytics: false,
            churnAnalytics: false,
            retentionAnalytics: false,
            cohortAnalysisPlatform: false,
            predictiveAnalyticsPlatform: false,
            marketTrends: false,
            competitiveAnalysis: false,
            customerInsights: false,
            segmentAnalysis: false,
            abTesting: false,
            funnelAnalysis: false,
            heatmapsPlatform: false,
            dashboards: false,
            customReportsPlatform: false,
            scheduledReports: false,
            dataExport: false,
            biIntegration: false,
            platformAuthentication: false,
            ssoIntegration: false,
            oauth: false,
            oauthProviderPlatform: false,
            ldapIntegrationPlatform: false,
            activeDirectoryPlatform: false,
            twoFactorAuthPlatform: false,
            biometricAuth: false,
            passwordPolicy: false,
            sessionManagementPlatform: false,
            ipWhitelist: false,
            geoBlocking: false,
            ddosProtectionPlatform: false,
            malwareProtection: false,
            vulnerabilityScanning: false,
            penetrationTestingPlatform: false,
            securityAudits: false,
            complianceReporting: false,
            gdprCompliancePlatform: false,
            ccpaCompliance: false,
            hipaaCompliancePlatform: false,
            pciDssCompliancePlatform: false,
            soc2CompliancePlatform: false,
            iso27001Compliance: false,
            dataEncryption: false
        }
    },

    PRO: {
        tier: 'PRO',
        label: 'Pro',
        monthlyPriceUsd: 49,
        limits: {
            maxProducts: 500,
            maxDiscountCodes: 50,
            maxStaffMembers: 5,
            aiRequestsPerDay: 100
        },
        features: {
            // Basic features - PRO gets some core features
            advancedAnalytics: true,
            prioritySupport: false,
            customDomain: false,
            abandonedCartRecovery: true,
            bulkProductImport: true,
            emailMarketing: true,
            facebookPixel: true,
            googleAnalytics: true,
            discountAutomation: true,
            loyaltyProgram: false,
            flashSales: true,
            pushNotifications: true,
            multiLanguage: false,
            posIntegration: false,
            inventoryAlerts: true,
            productVariants: true,
            bundleProducts: false,
            seasonalThemes: false,
            membershipTiers: false,
            giftCards: false,
            bookingSystem: false,
            waitlist: true,
            preOrders: false,
            wholesalePricing: false,
            whiteLabelBranding: false,
            apiAccess: false,
            customReports: false,
            advancedSegmentation: false,
            auditLogs: false,

            // AI Features - limited for PRO
            aiProductDescriptions: true,
            aiSeoOptimization: false,
            aiContentTranslation: false,
            aiBlogWriting: false,
            aiEmailDrafting: false,
            aiAdCopy: false,
            aiChatbot: true,
            aiVoiceAssistant: false,
            aiSentimentAnalysis: false,
            aiAutoResponder: false,
            aiTicketRouting: false,
            aiSalesForecasting: false,
            aiCustomerInsights: false,
            aiChurnPrediction: false,
            aiPriceOptimization: false,
            aiTrendDetection: false,
            aiImageGeneration: false,
            aiImageEnhancement: false,
            aiBackgroundRemoval: false,
            aiVideoGeneration: false,
            aiVirtualTryOn: false,
            aiPersonalization: false,
            aiAudienceSegmentation: false,
            aiCampaignOptimizer: false,
            aiAbTesting: false,

            // NEW AI Features (25) - Basic features enabled for PRO
            aiDemandForecasting: false,
            aiCustomerLifetimeValue: false,
            aiPriceElasticity: false,
            aiMarketBasketAnalysis: false,
            aiCustomerSegmentation: true,
            aiTrendPrediction: false,
            aiCompetitorAnalysis: false,
            aiPersonalizedRecommendations: true,
            aiDynamicPricing: false,
            aiSearchOptimization: true,
            aiVisualSearch: false,
            aiVoiceSearch: false,
            aiChatbotAdvanced: false,
            aiReviewSummarization: true,
            aiProductComparison: false,
            aiInventoryPrediction: false,
            aiFraudDetection: false,
            aiShippingOptimization: false,
            aiReturnPrediction: false,
            aiQualityControl: false,
            aiSupplierManagement: false,
            aiDemandPlanning: false,
            aiAutoCataloging: false,

            // Auto Pilot Core (20 features) - Basic features enabled for PRO
            autoPilotEnabled: false,
            aiDashboard: true,
            smartSuggestions: true,
            automatedDecisions: false,
            predictiveInsights: true,
            anomalyDetection: true,
            anomalyAlerts: false,
            smartNotifications: true,
            dailyBriefing: true,
            weeklyReport: false,
            trendAnalysis: true,
            opportunityDetection: true,
            riskAssessment: false,
            recommendationEngine: true,
            naturalLanguageQueries: false,
            aiVoiceCommands: false,
            smartSearch: true,
            contextualHelp: true,
            automatedOnboarding: false,
            smartTutorial: true,

            // Seller Auto Pilot (25 features) - All 25 enabled for PRO
            autoInventoryManagement: true,
            autoPricing: true,
            autoReorder: true,
            autoProductListings: true,
            autoSeo: true,
            autoAdSpend: true,
            autoEmailMarketing: true,
            autoSocialPosting: true,
            autoCustomerResponse: true,
            autoReviewResponse: true,
            autoOrderProcessing: true,
            autoRefund: false,
            autoCustomerSupport: true,
            autoAnalytics: true,
            autoCompetitorAnalysis: false,
            autoTrendProducts: true,
            autoPricingStrategy: true,
            autoInventoryAlerts: true,
            autoAbandonedCart: true,
            autoLoyaltyProgram: false,
            autoUpselling: true,
            autoCrossSelling: true,
            autoDiscounts: true,
            autoFlashSales: false,
            autoSeasonalCampaigns: false,

            // Platform Owner Auto Pilot (25 features) - All false for PRO
            autoVendorApproval: false,
            autoVendorMonitoring: false,
            autoFraudDetection: false,
            autoDisputeResolution: false,
            autoCompliance: false,
            autoRevenueOptimization: false,
            autoCommission: false,
            autoPlatformAnalytics: false,
            autoMarketInsights: false,
            autoTrendIdentification: false,
            autoUserBehavior: false,
            autoChurnPrediction: false,
            autoGrowthHacking: false,
            autoCampaignManagement: false,
            autoPartnerManagement: false,
            autoSupportRouting: false,
            autoContentModeration: false,
            autoPricingBenchmarking: false,
            autoCompetitiveIntelligence: false,
            autoRiskManagement: false,
            autoResourceScaling: false,
            autoSecurityMonitoring: false,
            autoPerformance: false,
            autoBackup: false,
            autoComplianceReports: false,

            // Core Platform - basic
            paypalIntegration: true,
            applePay: false,
            googlePay: false,
            buyNowPayLater: false,
            multiCurrency: false,
            multipleCarriers: true,
            shippingLabels: false,
            shipmentTracking: false,
            freeShipping: false,
            localPickup: false,
            automaticTax: false,
            vatHandling: false,
            taxReports: false,
            partialRefunds: true,
            packingSlips: false,
            orderExport: true,
            returnManagement: true,
            twoFactorAuth: false,
            gdprCompliance: false,
            sessionManagement: true,
            quickbooksIntegration: false,
            zendeskIntegration: false,
            slackIntegration: false,
            marketplaceAmazon: false,
            marketplaceEbay: false,

            // Advanced Marketing - limited
            smsMarketing: false,
            affiliateProgram: false,
            referralProgram: false,
            popupBuilder: false,
            countdownTimers: true,
            socialSharing: true,
            wishlistSharing: true,
            productRecommendations: true,
            relatedProducts: true,
            recentlyViewed: true,
            crossSelling: false,
            upselling: false,
            abandonedCheckoutRecovery: true,
            postPurchaseUpsell: false,
            checkoutAbandonment: true,
            cartAbandonment: true,
            dynamicPricing: false,
            volumeDiscounts: false,
            tieredPricing: false,
            customerGroupPricing: false,
            geoTargeting: false,
            popUpNotifications: false,
            announcementBars: false,
            newsletterSignup: true,
            leadCapture: false,
            landingPageBuilder: false,
            urlShortener: false,
            qrCodeGenerator: false,
            socialProof: false,
            urgencyIndicators: false,

            // Advanced Store Management - basic
            stockManagement: true,
            lowStockThreshold: true,
            outOfStockManagement: false,
            discontinuedProducts: false,
            productTemplates: false,
            categoryManagement: true,
            attributeManagement: false,
            brandManagement: false,
            vendorManagement: false,
            supplierManagement: false,
            costTracking: false,
            profitMarginCalculation: false,
            barcodeGeneration: false,
            skuGenerator: false,
            upcEanGenerator: false,
            productWeightDimensions: false,
            shippingDimensions: false,
            hsCodeClassification: false,
            manufacturerInfo: false,
            warrantyInfo: false,
            returnPolicy: true,
            refundPolicy: true,
            shippingPolicy: false,
            privacyPolicy: false,
            termsConditions: false,
            cookieConsent: false,
            ageVerification: false,
            productRating: true,
            reviewManagement: true,
            qaSection: false,

            // Advanced Orders - basic
            orderStatuses: true,
            orderNotes: true,
            orderMessages: false,
            orderAttachments: false,
            orderHistory: true,
            orderTimeline: false,
            orderTracking: false,
            orderWorkflows: false,
            orderApproval: false,
            orderHold: false,
            orderCancel: true,
            orderMerge: false,
            orderSplit: false,
            orderDuplicate: false,
            invoiceGeneration: false,
            creditMemos: false,
            orderReminders: false,
            backorderProcessing: false,
            preOrderManagement: false,
            subscriptionOrders: false,
            recurringOrders: false,
            wholesaleOrders: false,
            bulkOrderProcessing: false,
            orderImport: false,
            orderSearch: true,
            orderFiltering: true,

            // Advanced Customers - basic
            customerRegistration: true,
            customerLogin: true,
            customerProfiles: true,
            customerAddresses: true,
            customerPhone: false,
            customerNotes: false,
            customerTags: true,
            customerGroups: false,
            customerSegments: false,
            vipCustomers: false,
            customerRanking: false,
            customerBirthday: false,
            customerAnniversary: false,
            customerPreferences: false,
            customerNotifications: true,
            customerWishlist: true,
            customerReviews: true,
            customerReferrals: false,
            customerLoyalty: false,
            customerPoints: false,
            customerRewards: false,
            customerTierUpgrade: false,
            customerDowngrade: false,
            customerChurn: false,
            customerReactivation: false,

            // Advanced Analytics - basic
            salesReports: true,
            revenueReports: true,
            productReports: true,
            categoryReports: false,
            customerReports: false,
            trafficReports: false,
            conversionReports: false,
            cartAbandonmentReports: false,
            sourceReports: false,
            utmReports: false,
            deviceReports: false,
            locationReports: false,
            reportsScheduling: false,
            reportsExport: false,
            customDashboards: false,
            kpiTracking: false,
            goalTracking: false,
            benchmarkComparison: false,
            predictiveAnalytics: false,
            cohortAnalysis: false,
            lifetimeValue: false,
            attributionModeling: false,
            campaignPerformance: false,
            emailPerformance: false,
            socialPerformance: false,

            // Advanced Integrations - none for PRO
            shopifyImport: false,
            walmartChannel: false,
            etsyChannel: false,
            amazonChannel: false,
            ebayChannel: false,
            bigCommerceImport: false,
            woocommerceImport: false,
            magentoImport: false,
            quickbooksDesktop: false,
            xero: false,
            freshbooks: false,
            zoho: false,
            hubspot: false,
            salesforce: false,
            mailchimp: false,
            klaviyo: false,
            activecampaign: false,
            convertkit: false,
            sendgrid: false,
            twilio: false,
            nexmo: false,
            stripeRadar: false,
            paypalVenmo: false,
            applePayGateway: false,
            googlePayGateway: false,

            // Advanced Security & Performance - basic
            sslCertificate: true,
            ddosProtection: false,
            firewallProtection: false,
            malwareScanning: false,
            backupRestore: false,
            cdn: false,
            caching: false,
            imageOptimization: false,
            codeMinification: false,
            lazyLoading: false,
            pageSpeed: false,
            mobileOptimized: true,
            ampSupport: false,
            pwaSupport: false,
            http2Support: false,
            gzipCompression: false,
            databaseOptimization: false,
            queryOptimization: false,
            cdnGlobal: false,
            edgeComputing: false,

            // Advanced Mobile & Channel - basic
            iosApp: false,
            androidApp: false,
            mobileSite: true,
            mobileCheckout: true,
            mobilePayment: false,
            appleWatch: false,
            tabletOptimized: false,
            desktopApp: false,
            windowsApp: false,
            macApp: false,
            posMobile: false,
            qrCodeCheckout: false,
            nfcCheckout: false,
            voiceCheckout: false,
            chatbotMobile: false,
            smsOrdering: false,
            whatsappBusiness: false,
            instagramShopping: false,
            facebookShop: false,
            tiktokShop: false,

            // Advanced Automation - none for PRO
            workflowBuilder: false,
            triggerActions: false,
            timeTriggers: false,
            eventTriggers: false,
            conditionTriggers: false,
            automationSequences: false,
            dripCampaigns: false,
            onboardingFlows: false,
            onboardingSequence: false,
            onboardingEmails: false,
            winBackFlow: false,
            reviewRequestFlow: false,
            shippingNotificationFlow: false,
            orderConfirmationFlow: false,
            refundFlow: false,
            supportEscalation: false,
            leadScoring: false,
            behaviorTriggers: false,
            segmentUpdate: false,
            tagUpdate: false,
            listManagement: false,
            unsubscribes: false,
            spamComplaints: false,
            bounces: false,
            deliveryTracking: false,

            // Advanced Developer - none for PRO
            webhooks: false,
            restApi: false,
            graphqlApi: false,
            sdk: false,
            mobileSdk: false,
            pluginFramework: false,
            themeEditor: false,
            codeAccess: false,
            customCss: false,
            customJs: false,
            customDomainNew: false,
            subdomain: true,
            cnameRecord: false,
            mxRecord: false,
            apiKeys: false,
            apiRateLimiting: false,
            apiLogging: false,
            webhooksDebug: false,
            sandboxMode: false,
            testMode: false,
            developerDocs: false,
            communityForum: false,
            featureRequest: false,
            bugTracker: false,
            betaAccess: false,

            // Enterprise Features - none for PRO
            multiTenant: false,
            whiteLabelComplete: false,
            dedicatedServer: false,
            customInfrastructure: false,
            slaGuarantee: false,
            dedicatedSupport: false,
            priorityQueue: false,
            customQuota: false,
            unlimitedBandwidth: false,
            enterpriseCdn: false,
            dedicatedIp: false,
            sslPremium: false,
            securityAudit: false,
            complianceReports: false,
            hipaaCompliance: false,
            soc2Compliance: false,
            pciDssCompliance: false,
            iso27001: false,
            enterpriseBackup: false,
            disasterRecovery: false,
            businessContinuity: false,
            uptimeGuarantee: false,
            loadBalancing: false,
            autoScaling: false,
            containerSupport: false,
            kubernetesSupport: false,
            microservices: false,
            apiGateway: false,
            serviceMesh: false,
            loggingAdvanced: false,
            monitoringAdvanced: false,
            alertingAdvanced: false,
            incidentManagement: false,
            changeManagement: false,
            releaseManagement: false,
            deploymentAutomation: false,
            ciCdAdvanced: false,
            codeReview: false,
            securityScanning: false,
            penetrationTesting: false,
            vulnerabilityManagement: false,
            patchManagement: false,
            configurationManagement: false,
            secretsManagement: false,
            identityManagement: false,
            samlSso: false,
            oauthProvider: false,
            ldapIntegration: false,
            activeDirectory: false,

            // Social & Community - basic
            socialLogin: true,
            socialSharingNew: true,
            socialComments: false,
            socialRatings: true,
            socialReviews: true,
            messaging: false,
            notifications: true,
            activityFeed: false,
            userBadges: false,
            pointsSystem: false,
            leaderboards: false,
            testimonials: false,
            beforeAfter: false,
            comparisons: false,
            calculators: false,

            // Content & Media - basic
            cms: false,
            pageBuilder: false,
            blog: false,
            news: false,
            articles: false,
            mediaGallery: true,
            imageEditor: false,
            videoEditor: false,
            watermarking: false,
            cdnMedia: false,
            streaming: false,
            documentLibrary: false,
            fileManager: false,
            productVideos: false,
            product360View: false,

            // Financial - none for PRO
            doubleEntry: false,
            generalLedger: false,
            accountsPayable: false,
            accountsReceivable: false,
            invoicing: false,
            quotes: false,
            purchaseOrders: false,
            expenseTracking: false,
            budgetTracking: false,
            forecasting: false,
            cashFlow: false,
            profitLoss: false,
            balanceSheet: false,
            financialReports: false,
            taxPreparation: false,
            payroll: false,
            timeTracking: false,
            projectBilling: false,
            milestonePayments: false,

            // Data & Analytics - none for PRO
            dataWarehouse: false,
            etl: false,
            dataPipeline: false,
            realTimeAnalytics: false,
            clickstream: false,
            userBehavior: false,
            heatmaps: false,
            funnels: false,
            cohorts: false,
            retention: false,
            churnAnalysis: false,
            lifetimeValueNew: false,
            rfmAnalysis: false,
            marketBasket: false,
            nextBestAction: false,

            // Communication - basic
            videoConferencing: false,
            audioConferencing: false,
            screenSharingNew: false,
            fileSharing: false,
            documentCollaboration: false,
            recording: false,
            transcription: false,
            liveCaptioning: false,
            chat: false,
            directMessages: false,
            groupChat: false,
            channels: false,
            meetingScheduler: false,
            calendar: false,
            availability: false,

            // NEW PREMIUM FEATURES (25) - tiered for PRO
            // Advanced Marketing (5)
            reTargetingAds: true,
            influencerMarketing: false,
            affiliateTracking: true,
            loyaltyPoints: true,
            rewardsProgram: false,

            // Advanced Store Features (4)
            backOrders: true,
            groupBuying: false,
            dailyDeals: true,
            seasonalDiscounts: true,

            // Advanced Customer (6)
            customerPortals: true,
            returnPortal: false,
            giftRegistries: false,
            storeCredit: false,
            priceMatch: false,
            priceAlert: true,

            // Platform Owner / Global Admin Dashboard Features (200 features) - All false for PRO
            platformName: false,
            platformLogo: false,
            platformTheme: false,
            platformCurrency: false,
            platformLanguage: false,
            timezone: false,
            dateFormat: false,
            emailSettings: false,
            smtpSettings: false,
            emailTemplates: false,
            pushSettings: false,
            smsSettings: false,
            notificationSettings: false,
            maintenanceMode: false,
            platformStatus: false,
            platformVersion: false,
            platformUpdates: false,
            backupSettings: false,
            platformAnalytics: false,
            trafficAnalytics: false,
            userAnalytics: false,
            salesAnalytics: false,
            apiUsage: false,
            storageUsage: false,
            bandwidthUsage: false,
            platformHealth: false,
            serverStatus: false,
            databaseStatus: false,
            cacheStatus: false,
            queueStatus: false,
            schedulerStatus: false,
            platformLogs: false,
            errorLogs: false,
            accessLogs: false,
            auditLogsPlatform: false,
            platformSecurity: false,
            platformCompliance: false,
            dataRetention: false,
            privacyPolicyPlatform: false,
            termsOfService: false,
            cookiePolicy: false,
            vendorApproval: false,
            vendorVerification: false,
            vendorKyc: false,
            vendorContracts: false,
            vendorOnboarding: false,
            vendorTraining: false,
            vendorSupport: false,
            vendorCommunication: false,
            vendorPerformance: false,
            vendorRating: false,
            vendorReviews: false,
            vendorDisputes: false,
            vendorPayments: false,
            vendorPayouts: false,
            vendorCommissions: false,
            vendorFees: false,
            vendorBilling: false,
            vendorInvoices: false,
            vendorReports: false,
            vendorAnalytics: false,
            vendorDashboard: false,
            vendorPortal: false,
            vendorApi: false,
            vendorWebhooks: false,
            vendorIntegrations: false,
            vendorPlugins: false,
            vendorThemes: false,
            vendorBranding: false,
            vendorCustomDomain: false,
            vendorSsl: false,
            vendorEmail: false,
            vendorSupportPortal: false,
            vendorTemplates: false,
            vendorMarketplace: false,
            vendorSeo: false,
            vendorAnalyticsDashboard: false,
            vendorTraffic: false,
            vendorConversions: false,
            vendorRevenue: false,
            commissionStructure: false,
            commissionTiers: false,
            commissionRules: false,
            commissionCalculation: false,
            commissionPayout: false,
            commissionHold: false,
            commissionTax: false,
            commissionReporting: false,
            platformRevenue: false,
            revenueShare: false,
            platformRevenueReports: false,
            billingCycle: false,
            invoiceGenerationPlatform: false,
            paymentProcessing: false,
            refundProcessing: false,
            chargebackHandling: false,
            disputeResolution: false,
            paymentGateway: false,
            paymentMethods: false,
            currencySupport: false,
            multiCurrencyPayment: false,
            currencyConversion: false,
            forexRates: false,
            paymentSecurity: false,
            pciCompliance: false,
            paymentAnalytics: false,
            transactionLogs: false,
            reconciliation: false,
            accounting: false,
            financialReportsPlatform: false,
            multiVendor: false,
            vendorStores: false,
            vendorProducts: false,
            vendorOrders: false,
            marketplaceSearch: false,
            marketplaceBrowse: false,
            categoryManagementPlatform: false,
            productCatalog: false,
            productApproval: false,
            productModeration: false,
            inventoryManagement: false,
            stockManagementPlatform: false,
            orderManagement: false,
            fulfillment: false,
            shippingIntegration: false,
            returnsManagement: false,
            exchangeManagement: false,
            refundManagement: false,
            warrantyManagement: false,
            productReviews: false,
            reviewModeration: false,
            ratingsManagement: false,
            questionsAnswers: false,
            customerSupport: false,
            liveChat: false,
            helpCenter: false,
            knowledgeBase: false,
            faqManagement: false,
            ticketSystem: false,
            escalation: false,
            abuseManagement: false,
            counterfeitDetection: false,
            intellectualProperty: false,
            brandProtection: false,
            contentModeration: false,
            searchOptimization: false,
            seoTools: false,
            marketingTools: false,
            advertising: false,
            realTimeAnalyticsPlatform: false,
            salesAnalyticsPlatform: false,
            revenueAnalytics: false,
            trafficAnalyticsPlatform: false,
            conversionAnalytics: false,
            userBehaviorAnalytics: false,
            vendorPerformanceMetrics: false,
            productPerformance: false,
            orderAnalytics: false,
            cartAnalytics: false,
            churnAnalytics: false,
            retentionAnalytics: false,
            cohortAnalysisPlatform: false,
            predictiveAnalyticsPlatform: false,
            marketTrends: false,
            competitiveAnalysis: false,
            customerInsights: false,
            segmentAnalysis: false,
            abTesting: false,
            funnelAnalysis: false,
            heatmapsPlatform: false,
            dashboards: false,
            customReportsPlatform: false,
            scheduledReports: false,
            dataExport: false,
            biIntegration: false,
            platformAuthentication: false,
            ssoIntegration: false,
            oauth: false,
            oauthProviderPlatform: false,
            ldapIntegrationPlatform: false,
            activeDirectoryPlatform: false,
            twoFactorAuthPlatform: false,
            biometricAuth: false,
            passwordPolicy: false,
            sessionManagementPlatform: false,
            ipWhitelist: false,
            geoBlocking: false,
            ddosProtectionPlatform: false,
            malwareProtection: false,
            vulnerabilityScanning: false,
            penetrationTestingPlatform: false,
            securityAudits: false,
            complianceReporting: false,
            gdprCompliancePlatform: false,
            ccpaCompliance: false,
            hipaaCompliancePlatform: false,
            pciDssCompliancePlatform: false,
            soc2CompliancePlatform: false,
            iso27001Compliance: false,
            dataEncryption: false
        }
    },

    PREMIUM: {
        tier: 'PREMIUM',
        label: 'Premium',
        monthlyPriceUsd: 149,
        limits: {
            maxProducts: 2000,
            maxDiscountCodes: 200,
            maxStaffMembers: 20,
            aiRequestsPerDay: 500
        },
        features: {
            // Basic features - all true for PREMIUM
            advancedAnalytics: true,
            prioritySupport: true,
            customDomain: true,
            abandonedCartRecovery: true,
            bulkProductImport: true,
            emailMarketing: true,
            facebookPixel: true,
            googleAnalytics: true,
            discountAutomation: true,
            loyaltyProgram: true,
            flashSales: true,
            pushNotifications: true,
            multiLanguage: true,
            posIntegration: true,
            inventoryAlerts: true,
            productVariants: true,
            bundleProducts: true,
            seasonalThemes: true,
            membershipTiers: true,
            giftCards: true,
            bookingSystem: true,
            waitlist: true,
            preOrders: true,
            wholesalePricing: true,
            whiteLabelBranding: true,
            apiAccess: true,
            customReports: true,
            advancedSegmentation: true,
            auditLogs: true,

            // AI Features - most for PREMIUM
            aiProductDescriptions: true,
            aiSeoOptimization: true,
            aiContentTranslation: true,
            aiBlogWriting: true,
            aiEmailDrafting: true,
            aiAdCopy: true,
            aiChatbot: true,
            aiVoiceAssistant: true,
            aiSentimentAnalysis: true,
            aiAutoResponder: true,
            aiTicketRouting: true,
            aiSalesForecasting: true,
            aiCustomerInsights: true,
            aiChurnPrediction: true,
            aiPriceOptimization: true,
            aiTrendDetection: true,
            aiImageGeneration: true,
            aiImageEnhancement: true,
            aiBackgroundRemoval: true,
            aiVideoGeneration: true,
            aiVirtualTryOn: true,
            aiPersonalization: true,
            aiAudienceSegmentation: true,
            aiCampaignOptimizer: true,
            aiAbTesting: true,

            // NEW AI Features (25) - All enabled for PREMIUM
            aiDemandForecasting: true,
            aiCustomerLifetimeValue: true,
            aiPriceElasticity: true,
            aiMarketBasketAnalysis: true,
            aiCustomerSegmentation: true,
            aiTrendPrediction: true,
            aiCompetitorAnalysis: true,
            aiPersonalizedRecommendations: true,
            aiDynamicPricing: true,
            aiSearchOptimization: true,
            aiVisualSearch: true,
            aiVoiceSearch: true,
            aiChatbotAdvanced: true,
            aiReviewSummarization: true,
            aiProductComparison: true,
            aiInventoryPrediction: true,
            aiFraudDetection: true,
            aiShippingOptimization: true,
            aiReturnPrediction: true,
            aiQualityControl: true,
            aiSupplierManagement: true,
            aiDemandPlanning: true,
            aiAutoCataloging: true,

            // Core Platform - all true for PREMIUM
            paypalIntegration: true,
            applePay: true,
            googlePay: true,
            buyNowPayLater: true,
            multiCurrency: true,
            multipleCarriers: true,
            shippingLabels: true,
            shipmentTracking: true,
            freeShipping: true,
            localPickup: true,
            automaticTax: true,
            vatHandling: true,
            taxReports: true,
            partialRefunds: true,
            packingSlips: true,
            orderExport: true,
            returnManagement: true,
            twoFactorAuth: true,
            gdprCompliance: true,
            sessionManagement: true,
            quickbooksIntegration: true,
            zendeskIntegration: true,
            slackIntegration: true,
            marketplaceAmazon: true,
            marketplaceEbay: true,

            // Advanced Marketing - all true for PREMIUM
            smsMarketing: true,
            affiliateProgram: true,
            referralProgram: true,
            popupBuilder: true,
            countdownTimers: true,
            socialSharing: true,
            wishlistSharing: true,
            productRecommendations: true,
            relatedProducts: true,
            recentlyViewed: true,
            crossSelling: true,
            upselling: true,
            abandonedCheckoutRecovery: true,
            postPurchaseUpsell: true,
            checkoutAbandonment: true,
            cartAbandonment: true,
            dynamicPricing: true,
            volumeDiscounts: true,
            tieredPricing: true,
            customerGroupPricing: true,
            geoTargeting: true,
            popUpNotifications: true,
            announcementBars: true,
            newsletterSignup: true,
            leadCapture: true,
            landingPageBuilder: true,
            urlShortener: true,
            qrCodeGenerator: true,
            socialProof: true,
            urgencyIndicators: true,

            // Advanced Store Management - all true for PREMIUM
            stockManagement: true,
            lowStockThreshold: true,
            outOfStockManagement: true,
            discontinuedProducts: true,
            productTemplates: true,
            categoryManagement: true,
            attributeManagement: true,
            brandManagement: true,
            vendorManagement: true,
            supplierManagement: true,
            costTracking: true,
            profitMarginCalculation: true,
            barcodeGeneration: true,
            skuGenerator: true,
            upcEanGenerator: true,
            productWeightDimensions: true,
            shippingDimensions: true,
            hsCodeClassification: true,
            manufacturerInfo: true,
            warrantyInfo: true,
            returnPolicy: true,
            refundPolicy: true,
            shippingPolicy: true,
            privacyPolicy: true,
            termsConditions: true,
            cookieConsent: true,
            ageVerification: true,
            productRating: true,
            reviewManagement: true,
            qaSection: true,

            // Advanced Orders - all true for PREMIUM
            orderStatuses: true,
            orderNotes: true,
            orderMessages: true,
            orderAttachments: true,
            orderHistory: true,
            orderTimeline: true,
            orderTracking: true,
            orderWorkflows: true,
            orderApproval: true,
            orderHold: true,
            orderCancel: true,
            orderMerge: true,
            orderSplit: true,
            orderDuplicate: true,
            invoiceGeneration: true,
            creditMemos: true,
            orderReminders: true,
            backorderProcessing: true,
            preOrderManagement: true,
            subscriptionOrders: true,
            recurringOrders: true,
            wholesaleOrders: true,
            bulkOrderProcessing: true,
            orderImport: true,
            orderSearch: true,
            orderFiltering: true,

            // Advanced Customers - all true for PREMIUM
            customerRegistration: true,
            customerLogin: true,
            customerProfiles: true,
            customerAddresses: true,
            customerPhone: true,
            customerNotes: true,
            customerTags: true,
            customerGroups: true,
            customerSegments: true,
            vipCustomers: true,
            customerRanking: true,
            customerBirthday: true,
            customerAnniversary: true,
            customerPreferences: true,
            customerNotifications: true,
            customerWishlist: true,
            customerReviews: true,
            customerReferrals: true,
            customerLoyalty: true,
            customerPoints: true,
            customerRewards: true,
            customerTierUpgrade: true,
            customerDowngrade: true,
            customerChurn: true,
            customerReactivation: true,

            // Advanced Analytics - all true for PREMIUM
            salesReports: true,
            revenueReports: true,
            productReports: true,
            categoryReports: true,
            customerReports: true,
            trafficReports: true,
            conversionReports: true,
            cartAbandonmentReports: true,
            sourceReports: true,
            utmReports: true,
            deviceReports: true,
            locationReports: true,
            reportsScheduling: true,
            reportsExport: true,
            customDashboards: true,
            kpiTracking: true,
            goalTracking: true,
            benchmarkComparison: true,
            predictiveAnalytics: true,
            cohortAnalysis: true,
            lifetimeValue: true,
            attributionModeling: true,
            campaignPerformance: true,
            emailPerformance: true,
            socialPerformance: true,

            // Advanced Integrations - all true for PREMIUM
            shopifyImport: true,
            walmartChannel: true,
            etsyChannel: true,
            amazonChannel: true,
            ebayChannel: true,
            bigCommerceImport: true,
            woocommerceImport: true,
            magentoImport: true,
            quickbooksDesktop: true,
            xero: true,
            freshbooks: true,
            zoho: true,
            hubspot: true,
            salesforce: true,
            mailchimp: true,
            klaviyo: true,
            activecampaign: true,
            convertkit: true,
            sendgrid: true,
            twilio: true,
            nexmo: true,
            stripeRadar: true,
            paypalVenmo: true,
            applePayGateway: true,
            googlePayGateway: true,

            // Advanced Security & Performance - all true for PREMIUM
            sslCertificate: true,
            ddosProtection: true,
            firewallProtection: true,
            malwareScanning: true,
            backupRestore: true,
            cdn: true,
            caching: true,
            imageOptimization: true,
            codeMinification: true,
            lazyLoading: true,
            pageSpeed: true,
            mobileOptimized: true,
            ampSupport: true,
            pwaSupport: true,
            http2Support: true,
            gzipCompression: true,
            databaseOptimization: true,
            queryOptimization: true,
            cdnGlobal: true,
            edgeComputing: true,

            // Advanced Mobile & Channel - all true for PREMIUM
            iosApp: true,
            androidApp: true,
            mobileSite: true,
            mobileCheckout: true,
            mobilePayment: true,
            appleWatch: true,
            tabletOptimized: true,
            desktopApp: true,
            windowsApp: true,
            macApp: true,
            posMobile: true,
            qrCodeCheckout: true,
            nfcCheckout: true,
            voiceCheckout: true,
            chatbotMobile: true,
            smsOrdering: true,
            whatsappBusiness: true,
            instagramShopping: true,
            facebookShop: true,
            tiktokShop: true,

            // Advanced Automation - all true for PREMIUM
            workflowBuilder: true,
            triggerActions: true,
            timeTriggers: true,
            eventTriggers: true,
            conditionTriggers: true,
            automationSequences: true,
            dripCampaigns: true,
            onboardingFlows: true,
            onboardingSequence: true,
            onboardingEmails: true,
            winBackFlow: true,
            reviewRequestFlow: true,
            shippingNotificationFlow: true,
            orderConfirmationFlow: true,
            refundFlow: true,
            supportEscalation: true,
            leadScoring: true,
            behaviorTriggers: true,
            segmentUpdate: true,
            tagUpdate: true,
            listManagement: true,
            unsubscribes: true,
            spamComplaints: true,
            bounces: true,
            deliveryTracking: true,

            // Advanced Developer - all true for PREMIUM
            webhooks: true,
            restApi: true,
            graphqlApi: true,
            sdk: true,
            mobileSdk: true,
            pluginFramework: true,
            themeEditor: true,
            codeAccess: true,
            customCss: true,
            customJs: true,
            customDomainNew: true,
            subdomain: true,
            cnameRecord: true,
            mxRecord: true,
            apiKeys: true,
            apiRateLimiting: true,
            apiLogging: true,
            webhooksDebug: true,
            sandboxMode: true,
            testMode: true,
            developerDocs: true,
            communityForum: true,
            featureRequest: true,
            bugTracker: true,
            betaAccess: true,

            // Enterprise Features - none for PREMIUM
            multiTenant: false,
            whiteLabelComplete: false,
            dedicatedServer: false,
            customInfrastructure: false,
            slaGuarantee: false,
            dedicatedSupport: false,
            priorityQueue: false,
            customQuota: false,
            unlimitedBandwidth: false,
            enterpriseCdn: false,
            dedicatedIp: false,
            sslPremium: false,
            securityAudit: false,
            complianceReports: false,
            hipaaCompliance: false,
            soc2Compliance: false,
            pciDssCompliance: false,
            iso27001: false,
            enterpriseBackup: false,
            disasterRecovery: false,
            businessContinuity: false,
            uptimeGuarantee: false,
            loadBalancing: false,
            autoScaling: false,
            containerSupport: false,
            kubernetesSupport: false,
            microservices: false,
            apiGateway: false,
            serviceMesh: false,
            loggingAdvanced: false,
            monitoringAdvanced: false,
            alertingAdvanced: false,
            incidentManagement: false,
            changeManagement: false,
            releaseManagement: false,
            deploymentAutomation: false,
            ciCdAdvanced: false,
            codeReview: false,
            securityScanning: false,
            penetrationTesting: false,
            vulnerabilityManagement: false,
            patchManagement: false,
            configurationManagement: false,
            secretsManagement: false,
            identityManagement: false,
            samlSso: false,
            oauthProvider: false,
            ldapIntegration: false,
            activeDirectory: false,

            // Social & Community - all true for PREMIUM
            socialLogin: true,
            socialSharingNew: true,
            socialComments: true,
            socialRatings: true,
            socialReviews: true,
            messaging: true,
            notifications: true,
            activityFeed: true,
            userBadges: true,
            pointsSystem: true,
            leaderboards: true,
            testimonials: true,
            beforeAfter: true,
            comparisons: true,
            calculators: true,

            // Content & Media - all true for PREMIUM
            cms: true,
            pageBuilder: true,
            blog: true,
            news: true,
            articles: true,
            mediaGallery: true,
            imageEditor: true,
            videoEditor: true,
            watermarking: true,
            cdnMedia: true,
            streaming: true,
            documentLibrary: true,
            fileManager: true,
            productVideos: true,
            product360View: true,

            // Financial - all true for PREMIUM
            doubleEntry: true,
            generalLedger: true,
            accountsPayable: true,
            accountsReceivable: true,
            invoicing: true,
            quotes: true,
            purchaseOrders: true,
            expenseTracking: true,
            budgetTracking: true,
            forecasting: true,
            cashFlow: true,
            profitLoss: true,
            balanceSheet: true,
            financialReports: true,
            taxPreparation: true,
            payroll: true,
            timeTracking: true,
            projectBilling: true,
            milestonePayments: true,

            // Data & Analytics - all true for PREMIUM
            dataWarehouse: true,
            etl: true,
            dataPipeline: true,
            realTimeAnalytics: true,
            clickstream: true,
            userBehavior: true,
            heatmaps: true,
            funnels: true,
            cohorts: true,
            retention: true,
            churnAnalysis: true,
            lifetimeValueNew: true,
            rfmAnalysis: true,
            marketBasket: true,
            nextBestAction: true,

            // Communication - all true for PREMIUM
            videoConferencing: true,
            audioConferencing: true,
            screenSharingNew: true,
            fileSharing: true,
            documentCollaboration: true,
            recording: true,
            transcription: true,
            liveCaptioning: true,
            chat: true,
            directMessages: true,
            groupChat: true,
            channels: true,
            meetingScheduler: true,
            calendar: true,
            availability: true,

            // Auto Pilot Core (20 features) - All core enabled for PREMIUM
            autoPilotEnabled: false,
            aiDashboard: true,
            smartSuggestions: true,
            automatedDecisions: true,
            predictiveInsights: true,
            anomalyDetection: true,
            anomalyAlerts: true,
            smartNotifications: true,
            dailyBriefing: true,
            weeklyReport: true,
            trendAnalysis: true,
            opportunityDetection: true,
            riskAssessment: true,
            recommendationEngine: true,
            naturalLanguageQueries: true,
            aiVoiceCommands: false,
            smartSearch: true,
            contextualHelp: true,
            automatedOnboarding: true,
            smartTutorial: true,

            // Seller Auto Pilot (25 features) - All 25 enabled for PREMIUM
            autoInventoryManagement: true,
            autoPricing: true,
            autoReorder: true,
            autoProductListings: true,
            autoSeo: true,
            autoAdSpend: true,
            autoEmailMarketing: true,
            autoSocialPosting: true,
            autoCustomerResponse: true,
            autoReviewResponse: true,
            autoOrderProcessing: true,
            autoRefund: true,
            autoCustomerSupport: true,
            autoAnalytics: true,
            autoCompetitorAnalysis: true,
            autoTrendProducts: true,
            autoPricingStrategy: true,
            autoInventoryAlerts: true,
            autoAbandonedCart: true,
            autoLoyaltyProgram: true,
            autoUpselling: true,
            autoCrossSelling: true,
            autoDiscounts: true,
            autoFlashSales: true,
            autoSeasonalCampaigns: true,

            // Platform Owner Auto Pilot (25 features) - Basic 25 enabled for PREMIUM
            autoVendorApproval: true,
            autoVendorMonitoring: true,
            autoFraudDetection: true,
            autoDisputeResolution: false,
            autoCompliance: true,
            autoRevenueOptimization: true,
            autoCommission: true,
            autoPlatformAnalytics: true,
            autoMarketInsights: true,
            autoTrendIdentification: true,
            autoUserBehavior: true,
            autoChurnPrediction: true,
            autoGrowthHacking: false,
            autoCampaignManagement: true,
            autoPartnerManagement: false,
            autoSupportRouting: true,
            autoContentModeration: true,
            autoPricingBenchmarking: true,
            autoCompetitiveIntelligence: false,
            autoRiskManagement: true,
            autoResourceScaling: false,
            autoSecurityMonitoring: true,
            autoPerformance: true,
            autoBackup: false,
            autoComplianceReports: true,

            // NEW PREMIUM FEATURES (25) - all true for PREMIUM
            // Advanced Marketing (5)
            reTargetingAds: true,
            influencerMarketing: true,
            affiliateTracking: true,
            loyaltyPoints: true,
            rewardsProgram: true,

            // Advanced Store Features (4)
            backOrders: true,
            groupBuying: true,
            dailyDeals: true,
            seasonalDiscounts: true,

            // Advanced Customer (6)
            customerPortals: true,
            returnPortal: true,
            giftRegistries: true,
            storeCredit: true,
            priceMatch: true,
            priceAlert: true,

            // Platform Owner / Global Admin Dashboard Features (200 features) - All false for PREMIUM
            platformName: false,
            platformLogo: false,
            platformTheme: false,
            platformCurrency: false,
            platformLanguage: false,
            timezone: false,
            dateFormat: false,
            emailSettings: false,
            smtpSettings: false,
            emailTemplates: false,
            pushSettings: false,
            smsSettings: false,
            notificationSettings: false,
            maintenanceMode: false,
            platformStatus: false,
            platformVersion: false,
            platformUpdates: false,
            backupSettings: false,
            platformAnalytics: false,
            trafficAnalytics: false,
            userAnalytics: false,
            salesAnalytics: false,
            apiUsage: false,
            storageUsage: false,
            bandwidthUsage: false,
            platformHealth: false,
            serverStatus: false,
            databaseStatus: false,
            cacheStatus: false,
            queueStatus: false,
            schedulerStatus: false,
            platformLogs: false,
            errorLogs: false,
            accessLogs: false,
            auditLogsPlatform: false,
            platformSecurity: false,
            platformCompliance: false,
            dataRetention: false,
            privacyPolicyPlatform: false,
            termsOfService: false,
            cookiePolicy: false,
            vendorApproval: false,
            vendorVerification: false,
            vendorKyc: false,
            vendorContracts: false,
            vendorOnboarding: false,
            vendorTraining: false,
            vendorSupport: false,
            vendorCommunication: false,
            vendorPerformance: false,
            vendorRating: false,
            vendorReviews: false,
            vendorDisputes: false,
            vendorPayments: false,
            vendorPayouts: false,
            vendorCommissions: false,
            vendorFees: false,
            vendorBilling: false,
            vendorInvoices: false,
            vendorReports: false,
            vendorAnalytics: false,
            vendorDashboard: false,
            vendorPortal: false,
            vendorApi: false,
            vendorWebhooks: false,
            vendorIntegrations: false,
            vendorPlugins: false,
            vendorThemes: false,
            vendorBranding: false,
            vendorCustomDomain: false,
            vendorSsl: false,
            vendorEmail: false,
            vendorSupportPortal: false,
            vendorTemplates: false,
            vendorMarketplace: false,
            vendorSeo: false,
            vendorAnalyticsDashboard: false,
            vendorTraffic: false,
            vendorConversions: false,
            vendorRevenue: false,
            commissionStructure: false,
            commissionTiers: false,
            commissionRules: false,
            commissionCalculation: false,
            commissionPayout: false,
            commissionHold: false,
            commissionTax: false,
            commissionReporting: false,
            platformRevenue: false,
            revenueShare: false,
            platformRevenueReports: false,
            billingCycle: false,
            invoiceGenerationPlatform: false,
            paymentProcessing: false,
            refundProcessing: false,
            chargebackHandling: false,
            disputeResolution: false,
            paymentGateway: false,
            paymentMethods: false,
            currencySupport: false,
            multiCurrencyPayment: false,
            currencyConversion: false,
            forexRates: false,
            paymentSecurity: false,
            pciCompliance: false,
            paymentAnalytics: false,
            transactionLogs: false,
            reconciliation: false,
            accounting: false,
            financialReportsPlatform: false,
            multiVendor: false,
            vendorStores: false,
            vendorProducts: false,
            vendorOrders: false,
            marketplaceSearch: false,
            marketplaceBrowse: false,
            categoryManagementPlatform: false,
            productCatalog: false,
            productApproval: false,
            productModeration: false,
            inventoryManagement: false,
            stockManagementPlatform: false,
            orderManagement: false,
            fulfillment: false,
            shippingIntegration: false,
            returnsManagement: false,
            exchangeManagement: false,
            refundManagement: false,
            warrantyManagement: false,
            productReviews: false,
            reviewModeration: false,
            ratingsManagement: false,
            questionsAnswers: false,
            customerSupport: false,
            liveChat: false,
            helpCenter: false,
            knowledgeBase: false,
            faqManagement: false,
            ticketSystem: false,
            escalation: false,
            abuseManagement: false,
            counterfeitDetection: false,
            intellectualProperty: false,
            brandProtection: false,
            contentModeration: false,
            searchOptimization: false,
            seoTools: false,
            marketingTools: false,
            advertising: false,
            realTimeAnalyticsPlatform: false,
            salesAnalyticsPlatform: false,
            revenueAnalytics: false,
            trafficAnalyticsPlatform: false,
            conversionAnalytics: false,
            userBehaviorAnalytics: false,
            vendorPerformanceMetrics: false,
            productPerformance: false,
            orderAnalytics: false,
            cartAnalytics: false,
            churnAnalytics: false,
            retentionAnalytics: false,
            cohortAnalysisPlatform: false,
            predictiveAnalyticsPlatform: false,
            marketTrends: false,
            competitiveAnalysis: false,
            customerInsights: false,
            segmentAnalysis: false,
            abTesting: false,
            funnelAnalysis: false,
            heatmapsPlatform: false,
            dashboards: false,
            customReportsPlatform: false,
            scheduledReports: false,
            dataExport: false,
            biIntegration: false,
            platformAuthentication: false,
            ssoIntegration: false,
            oauth: false,
            oauthProviderPlatform: false,
            ldapIntegrationPlatform: false,
            activeDirectoryPlatform: false,
            twoFactorAuthPlatform: false,
            biometricAuth: false,
            passwordPolicy: false,
            sessionManagementPlatform: false,
            ipWhitelist: false,
            geoBlocking: false,
            ddosProtectionPlatform: false,
            malwareProtection: false,
            vulnerabilityScanning: false,
            penetrationTestingPlatform: false,
            securityAudits: false,
            complianceReporting: false,
            gdprCompliancePlatform: false,
            ccpaCompliance: false,
            hipaaCompliancePlatform: false,
            pciDssCompliancePlatform: false,
            soc2CompliancePlatform: false,
            iso27001Compliance: false,
            dataEncryption: false
        }
    },

    ENTERPRISE: {
        tier: 'ENTERPRISE',
        label: 'Enterprise',
        monthlyPriceUsd: 499,
        limits: {
            maxProducts: -1, // unlimited
            maxDiscountCodes: -1,
            maxStaffMembers: -1,
            aiRequestsPerDay: -1
        },
        features: {
            // All features true for ENTERPRISE
            // Basic features
            advancedAnalytics: true,
            prioritySupport: true,
            customDomain: true,
            abandonedCartRecovery: true,
            bulkProductImport: true,
            emailMarketing: true,
            facebookPixel: true,
            googleAnalytics: true,
            discountAutomation: true,
            loyaltyProgram: true,
            flashSales: true,
            pushNotifications: true,
            multiLanguage: true,
            posIntegration: true,
            inventoryAlerts: true,
            productVariants: true,
            bundleProducts: true,
            seasonalThemes: true,
            membershipTiers: true,
            giftCards: true,
            bookingSystem: true,
            waitlist: true,
            preOrders: true,
            wholesalePricing: true,
            whiteLabelBranding: true,
            apiAccess: true,
            customReports: true,
            advancedSegmentation: true,
            auditLogs: true,

            // AI Features
            aiProductDescriptions: true,
            aiSeoOptimization: true,
            aiContentTranslation: true,
            aiBlogWriting: true,
            aiEmailDrafting: true,
            aiAdCopy: true,
            aiChatbot: true,
            aiVoiceAssistant: true,
            aiSentimentAnalysis: true,
            aiAutoResponder: true,
            aiTicketRouting: true,
            aiSalesForecasting: true,
            aiCustomerInsights: true,
            aiChurnPrediction: true,
            aiPriceOptimization: true,
            aiTrendDetection: true,
            aiImageGeneration: true,
            aiImageEnhancement: true,
            aiBackgroundRemoval: true,
            aiVideoGeneration: true,
            aiVirtualTryOn: true,
            aiPersonalization: true,
            aiAudienceSegmentation: true,
            aiCampaignOptimizer: true,
            aiAbTesting: true,

            // NEW AI Features (25) - All enabled for ENTERPRISE
            aiDemandForecasting: true,
            aiCustomerLifetimeValue: true,
            aiPriceElasticity: true,
            aiMarketBasketAnalysis: true,
            aiCustomerSegmentation: true,
            aiTrendPrediction: true,
            aiCompetitorAnalysis: true,
            aiPersonalizedRecommendations: true,
            aiDynamicPricing: true,
            aiSearchOptimization: true,
            aiVisualSearch: true,
            aiVoiceSearch: true,
            aiChatbotAdvanced: true,
            aiReviewSummarization: true,
            aiProductComparison: true,
            aiInventoryPrediction: true,
            aiFraudDetection: true,
            aiShippingOptimization: true,
            aiReturnPrediction: true,
            aiQualityControl: true,
            aiSupplierManagement: true,
            aiDemandPlanning: true,
            aiAutoCataloging: true,

            // Auto Pilot Core (20 features) - All 20 enabled for ENTERPRISE
            autoPilotEnabled: true,
            aiDashboard: true,
            smartSuggestions: true,
            automatedDecisions: true,
            predictiveInsights: true,
            anomalyDetection: true,
            anomalyAlerts: true,
            smartNotifications: true,
            dailyBriefing: true,
            weeklyReport: true,
            trendAnalysis: true,
            opportunityDetection: true,
            riskAssessment: true,
            recommendationEngine: true,
            naturalLanguageQueries: true,
            aiVoiceCommands: true,
            smartSearch: true,
            contextualHelp: true,
            automatedOnboarding: true,
            smartTutorial: true,

            // Seller Auto Pilot (25 features) - All 25 enabled for ENTERPRISE
            autoInventoryManagement: true,
            autoPricing: true,
            autoReorder: true,
            autoProductListings: true,
            autoSeo: true,
            autoAdSpend: true,
            autoEmailMarketing: true,
            autoSocialPosting: true,
            autoCustomerResponse: true,
            autoReviewResponse: true,
            autoOrderProcessing: true,
            autoRefund: true,
            autoCustomerSupport: true,
            autoAnalytics: true,
            autoCompetitorAnalysis: true,
            autoTrendProducts: true,
            autoPricingStrategy: true,
            autoInventoryAlerts: true,
            autoAbandonedCart: true,
            autoLoyaltyProgram: true,
            autoUpselling: true,
            autoCrossSelling: true,
            autoDiscounts: true,
            autoFlashSales: true,
            autoSeasonalCampaigns: true,

            // Platform Owner Auto Pilot (25 features) - All 25 enabled for ENTERPRISE
            autoVendorApproval: true,
            autoVendorMonitoring: true,
            autoFraudDetection: true,
            autoDisputeResolution: true,
            autoCompliance: true,
            autoRevenueOptimization: true,
            autoCommission: true,
            autoPlatformAnalytics: true,
            autoMarketInsights: true,
            autoTrendIdentification: true,
            autoUserBehavior: true,
            autoChurnPrediction: true,
            autoGrowthHacking: true,
            autoCampaignManagement: true,
            autoPartnerManagement: true,
            autoSupportRouting: true,
            autoContentModeration: true,
            autoPricingBenchmarking: true,
            autoCompetitiveIntelligence: true,
            autoRiskManagement: true,
            autoResourceScaling: true,
            autoSecurityMonitoring: true,
            autoPerformance: true,
            autoBackup: true,
            autoComplianceReports: true,

            // Core Platform
            paypalIntegration: true,
            applePay: true,
            googlePay: true,
            buyNowPayLater: true,
            multiCurrency: true,
            multipleCarriers: true,
            shippingLabels: true,
            shipmentTracking: true,
            freeShipping: true,
            localPickup: true,
            automaticTax: true,
            vatHandling: true,
            taxReports: true,
            partialRefunds: true,
            packingSlips: true,
            orderExport: true,
            returnManagement: true,
            twoFactorAuth: true,
            gdprCompliance: true,
            sessionManagement: true,
            quickbooksIntegration: true,
            zendeskIntegration: true,
            slackIntegration: true,
            marketplaceAmazon: true,
            marketplaceEbay: true,

            // Advanced Marketing
            smsMarketing: true,
            affiliateProgram: true,
            referralProgram: true,
            popupBuilder: true,
            countdownTimers: true,
            socialSharing: true,
            wishlistSharing: true,
            productRecommendations: true,
            relatedProducts: true,
            recentlyViewed: true,
            crossSelling: true,
            upselling: true,
            abandonedCheckoutRecovery: true,
            postPurchaseUpsell: true,
            checkoutAbandonment: true,
            cartAbandonment: true,
            dynamicPricing: true,
            volumeDiscounts: true,
            tieredPricing: true,
            customerGroupPricing: true,
            geoTargeting: true,
            popUpNotifications: true,
            announcementBars: true,
            newsletterSignup: true,
            leadCapture: true,
            landingPageBuilder: true,
            urlShortener: true,
            qrCodeGenerator: true,
            socialProof: true,
            urgencyIndicators: true,

            // Advanced Store Management
            stockManagement: true,
            lowStockThreshold: true,
            outOfStockManagement: true,
            discontinuedProducts: true,
            productTemplates: true,
            categoryManagement: true,
            attributeManagement: true,
            brandManagement: true,
            vendorManagement: true,
            supplierManagement: true,
            costTracking: true,
            profitMarginCalculation: true,
            barcodeGeneration: true,
            skuGenerator: true,
            upcEanGenerator: true,
            productWeightDimensions: true,
            shippingDimensions: true,
            hsCodeClassification: true,
            manufacturerInfo: true,
            warrantyInfo: true,
            returnPolicy: true,
            refundPolicy: true,
            shippingPolicy: true,
            privacyPolicy: true,
            termsConditions: true,
            cookieConsent: true,
            ageVerification: true,
            productRating: true,
            reviewManagement: true,
            qaSection: true,

            // Advanced Orders
            orderStatuses: true,
            orderNotes: true,
            orderMessages: true,
            orderAttachments: true,
            orderHistory: true,
            orderTimeline: true,
            orderTracking: true,
            orderWorkflows: true,
            orderApproval: true,
            orderHold: true,
            orderCancel: true,
            orderMerge: true,
            orderSplit: true,
            orderDuplicate: true,
            invoiceGeneration: true,
            creditMemos: true,
            orderReminders: true,
            backorderProcessing: true,
            preOrderManagement: true,
            subscriptionOrders: true,
            recurringOrders: true,
            wholesaleOrders: true,
            bulkOrderProcessing: true,
            orderImport: true,
            orderSearch: true,
            orderFiltering: true,

            // Advanced Customers
            customerRegistration: true,
            customerLogin: true,
            customerProfiles: true,
            customerAddresses: true,
            customerPhone: true,
            customerNotes: true,
            customerTags: true,
            customerGroups: true,
            customerSegments: true,
            vipCustomers: true,
            customerRanking: true,
            customerBirthday: true,
            customerAnniversary: true,
            customerPreferences: true,
            customerNotifications: true,
            customerWishlist: true,
            customerReviews: true,
            customerReferrals: true,
            customerLoyalty: true,
            customerPoints: true,
            customerRewards: true,
            customerTierUpgrade: true,
            customerDowngrade: true,
            customerChurn: true,
            customerReactivation: true,

            // Advanced Analytics
            salesReports: true,
            revenueReports: true,
            productReports: true,
            categoryReports: true,
            customerReports: true,
            trafficReports: true,
            conversionReports: true,
            cartAbandonmentReports: true,
            sourceReports: true,
            utmReports: true,
            deviceReports: true,
            locationReports: true,
            reportsScheduling: true,
            reportsExport: true,
            customDashboards: true,
            kpiTracking: true,
            goalTracking: true,
            benchmarkComparison: true,
            predictiveAnalytics: true,
            cohortAnalysis: true,
            lifetimeValue: true,
            attributionModeling: true,
            campaignPerformance: true,
            emailPerformance: true,
            socialPerformance: true,

            // Advanced Integrations
            shopifyImport: true,
            walmartChannel: true,
            etsyChannel: true,
            amazonChannel: true,
            ebayChannel: true,
            bigCommerceImport: true,
            woocommerceImport: true,
            magentoImport: true,
            quickbooksDesktop: true,
            xero: true,
            freshbooks: true,
            zoho: true,
            hubspot: true,
            salesforce: true,
            mailchimp: true,
            klaviyo: true,
            activecampaign: true,
            convertkit: true,
            sendgrid: true,
            twilio: true,
            nexmo: true,
            stripeRadar: true,
            paypalVenmo: true,
            applePayGateway: true,
            googlePayGateway: true,

            // Advanced Security & Performance
            sslCertificate: true,
            ddosProtection: true,
            firewallProtection: true,
            malwareScanning: true,
            backupRestore: true,
            cdn: true,
            caching: true,
            imageOptimization: true,
            codeMinification: true,
            lazyLoading: true,
            pageSpeed: true,
            mobileOptimized: true,
            ampSupport: true,
            pwaSupport: true,
            http2Support: true,
            gzipCompression: true,
            databaseOptimization: true,
            queryOptimization: true,
            cdnGlobal: true,
            edgeComputing: true,

            // Advanced Mobile & Channel
            iosApp: true,
            androidApp: true,
            mobileSite: true,
            mobileCheckout: true,
            mobilePayment: true,
            appleWatch: true,
            tabletOptimized: true,
            desktopApp: true,
            windowsApp: true,
            macApp: true,
            posMobile: true,
            qrCodeCheckout: true,
            nfcCheckout: true,
            voiceCheckout: true,
            chatbotMobile: true,
            smsOrdering: true,
            whatsappBusiness: true,
            instagramShopping: true,
            facebookShop: true,
            tiktokShop: true,

            // Advanced Automation
            workflowBuilder: true,
            triggerActions: true,
            timeTriggers: true,
            eventTriggers: true,
            conditionTriggers: true,
            automationSequences: true,
            dripCampaigns: true,
            onboardingFlows: true,
            onboardingSequence: true,
            onboardingEmails: true,
            winBackFlow: true,
            reviewRequestFlow: true,
            shippingNotificationFlow: true,
            orderConfirmationFlow: true,
            refundFlow: true,
            supportEscalation: true,
            leadScoring: true,
            behaviorTriggers: true,
            segmentUpdate: true,
            tagUpdate: true,
            listManagement: true,
            unsubscribes: true,
            spamComplaints: true,
            bounces: true,
            deliveryTracking: true,

            // Advanced Developer
            webhooks: true,
            restApi: true,
            graphqlApi: true,
            sdk: true,
            mobileSdk: true,
            pluginFramework: true,
            themeEditor: true,
            codeAccess: true,
            customCss: true,
            customJs: true,
            customDomainNew: true,
            subdomain: true,
            cnameRecord: true,
            mxRecord: true,
            apiKeys: true,
            apiRateLimiting: true,
            apiLogging: true,
            webhooksDebug: true,
            sandboxMode: true,
            testMode: true,
            developerDocs: true,
            communityForum: true,
            featureRequest: true,
            bugTracker: true,
            betaAccess: true,

            // Enterprise Features - all true
            multiTenant: true,
            whiteLabelComplete: true,
            dedicatedServer: true,
            customInfrastructure: true,
            slaGuarantee: true,
            dedicatedSupport: true,
            priorityQueue: true,
            customQuota: true,
            unlimitedBandwidth: true,
            enterpriseCdn: true,
            dedicatedIp: true,
            sslPremium: true,
            securityAudit: true,
            complianceReports: true,
            hipaaCompliance: true,
            soc2Compliance: true,
            pciDssCompliance: true,
            iso27001: true,
            enterpriseBackup: true,
            disasterRecovery: true,
            businessContinuity: true,
            uptimeGuarantee: true,
            loadBalancing: true,
            autoScaling: true,
            containerSupport: true,
            kubernetesSupport: true,
            microservices: true,
            apiGateway: true,
            serviceMesh: true,
            loggingAdvanced: true,
            monitoringAdvanced: true,
            alertingAdvanced: true,
            incidentManagement: true,
            changeManagement: true,
            releaseManagement: true,
            deploymentAutomation: true,
            ciCdAdvanced: true,
            codeReview: true,
            securityScanning: true,
            penetrationTesting: true,
            vulnerabilityManagement: true,
            patchManagement: true,
            configurationManagement: true,
            secretsManagement: true,
            identityManagement: true,
            samlSso: true,
            oauthProvider: true,
            ldapIntegration: true,
            activeDirectory: true,

            // Social & Community
            socialLogin: true,
            socialSharingNew: true,
            socialComments: true,
            socialRatings: true,
            socialReviews: true,
            messaging: true,
            notifications: true,
            activityFeed: true,
            userBadges: true,
            pointsSystem: true,
            leaderboards: true,
            testimonials: true,
            beforeAfter: true,
            comparisons: true,
            calculators: true,

            // Content & Media
            cms: true,
            pageBuilder: true,
            blog: true,
            news: true,
            articles: true,
            mediaGallery: true,
            imageEditor: true,
            videoEditor: true,
            watermarking: true,
            cdnMedia: true,
            streaming: true,
            documentLibrary: true,
            fileManager: true,
            productVideos: true,
            product360View: true,

            // Financial
            doubleEntry: true,
            generalLedger: true,
            accountsPayable: true,
            accountsReceivable: true,
            invoicing: true,
            quotes: true,
            purchaseOrders: true,
            expenseTracking: true,
            budgetTracking: true,
            forecasting: true,
            cashFlow: true,
            profitLoss: true,
            balanceSheet: true,
            financialReports: true,
            taxPreparation: true,
            payroll: true,
            timeTracking: true,
            projectBilling: true,
            milestonePayments: true,

            // Data & Analytics
            dataWarehouse: true,
            etl: true,
            dataPipeline: true,
            realTimeAnalytics: true,
            clickstream: true,
            userBehavior: true,
            heatmaps: true,
            funnels: true,
            cohorts: true,
            retention: true,
            churnAnalysis: true,
            lifetimeValueNew: true,
            rfmAnalysis: true,
            marketBasket: true,
            nextBestAction: true,

            // Communication
            videoConferencing: true,
            audioConferencing: true,
            screenSharingNew: true,
            fileSharing: true,
            documentCollaboration: true,
            recording: true,
            transcription: true,
            liveCaptioning: true,
            chat: true,
            directMessages: true,
            groupChat: true,
            channels: true,
            meetingScheduler: true,
            calendar: true,
            availability: true,

            // NEW PREMIUM FEATURES (25) - all true for ENTERPRISE
            // Advanced Marketing (5)
            reTargetingAds: true,
            influencerMarketing: true,
            affiliateTracking: true,
            loyaltyPoints: true,
            rewardsProgram: true,

            // Advanced Store Features (4)
            backOrders: true,
            groupBuying: true,
            dailyDeals: true,
            seasonalDiscounts: true,

            // Advanced Customer (6)
            customerPortals: true,
            returnPortal: true,
            giftRegistries: true,
            storeCredit: true,
            priceMatch: true,
            priceAlert: true,

            // ====== PLATFORM OWNER / GLOBAL ADMIN DASHBOARD FEATURES (200 features) ======
            // ====== Platform Management (40 features) ======
            platformName: true,
            platformLogo: true,
            platformTheme: true,
            platformCurrency: true,
            platformLanguage: true,
            timezone: true,
            dateFormat: true,
            emailSettings: true,
            smtpSettings: true,
            emailTemplates: true,
            pushSettings: true,
            smsSettings: true,
            notificationSettings: true,
            maintenanceMode: true,
            platformStatus: true,
            platformVersion: true,
            platformUpdates: true,
            backupSettings: true,
            platformAnalytics: true,
            trafficAnalytics: true,
            userAnalytics: true,
            salesAnalytics: true,
            apiUsage: true,
            storageUsage: true,
            bandwidthUsage: true,
            platformHealth: true,
            serverStatus: true,
            databaseStatus: true,
            cacheStatus: true,
            queueStatus: true,
            schedulerStatus: true,
            platformLogs: true,
            errorLogs: true,
            accessLogs: true,
            auditLogsPlatform: true,
            platformSecurity: true,
            platformCompliance: true,
            dataRetention: true,
            privacyPolicyPlatform: true,
            termsOfService: true,
            cookiePolicy: true,

            // ====== Vendor Management (40 features) ======
            vendorApproval: true,
            vendorVerification: true,
            vendorKyc: true,
            vendorContracts: true,
            vendorOnboarding: true,
            vendorTraining: true,
            vendorSupport: true,
            vendorCommunication: true,
            vendorPerformance: true,
            vendorRating: true,
            vendorReviews: true,
            vendorDisputes: true,
            vendorPayments: true,
            vendorPayouts: true,
            vendorCommissions: true,
            vendorFees: true,
            vendorBilling: true,
            vendorInvoices: true,
            vendorReports: true,
            vendorAnalytics: true,
            vendorDashboard: true,
            vendorPortal: true,
            vendorApi: true,
            vendorWebhooks: true,
            vendorIntegrations: true,
            vendorPlugins: true,
            vendorThemes: true,
            vendorBranding: true,
            vendorCustomDomain: true,
            vendorSsl: true,
            vendorEmail: true,
            vendorSupportPortal: true,
            vendorTemplates: true,
            vendorMarketplace: true,
            vendorSeo: true,
            vendorAnalyticsDashboard: true,
            vendorTraffic: true,
            vendorConversions: true,
            vendorRevenue: true,

            // ====== Commission & Billing (30 features) ======
            commissionStructure: true,
            commissionTiers: true,
            commissionRules: true,
            commissionCalculation: true,
            commissionPayout: true,
            commissionHold: true,
            commissionTax: true,
            commissionReporting: true,
            platformRevenue: true,
            revenueShare: true,
            platformRevenueReports: true,
            billingCycle: true,
            invoiceGenerationPlatform: true,
            paymentProcessing: true,
            refundProcessing: true,
            chargebackHandling: true,
            disputeResolution: true,
            paymentGateway: true,
            paymentMethods: true,
            currencySupport: true,
            multiCurrencyPayment: true,
            currencyConversion: true,
            forexRates: true,
            paymentSecurity: true,
            pciCompliance: true,
            paymentAnalytics: true,
            transactionLogs: true,
            reconciliation: true,
            accounting: true,
            financialReportsPlatform: true,

            // ====== Marketplace Features (40 features) ======
            multiVendor: true,
            vendorStores: true,
            vendorProducts: true,
            vendorOrders: true,
            marketplaceSearch: true,
            marketplaceBrowse: true,
            categoryManagementPlatform: true,
            productCatalog: true,
            productApproval: true,
            productModeration: true,
            inventoryManagement: true,
            stockManagementPlatform: true,
            orderManagement: true,
            fulfillment: true,
            shippingIntegration: true,
            returnsManagement: true,
            exchangeManagement: true,
            refundManagement: true,
            warrantyManagement: true,
            productReviews: true,
            reviewModeration: true,
            ratingsManagement: true,
            questionsAnswers: true,
            customerSupport: true,
            liveChat: true,
            helpCenter: true,
            knowledgeBase: true,
            faqManagement: true,
            ticketSystem: true,
            escalation: true,
            abuseManagement: true,
            counterfeitDetection: true,
            intellectualProperty: true,
            brandProtection: true,
            contentModeration: true,
            searchOptimization: true,
            seoTools: true,
            marketingTools: true,
            advertising: true,

            // ====== Platform Analytics (25 features) ======
            realTimeAnalyticsPlatform: true,
            salesAnalyticsPlatform: true,
            revenueAnalytics: true,
            trafficAnalyticsPlatform: true,
            conversionAnalytics: true,
            userBehaviorAnalytics: true,
            vendorPerformanceMetrics: true,
            productPerformance: true,
            orderAnalytics: true,
            cartAnalytics: true,
            churnAnalytics: true,
            retentionAnalytics: true,
            cohortAnalysisPlatform: true,
            predictiveAnalyticsPlatform: true,
            marketTrends: true,
            competitiveAnalysis: true,
            customerInsights: true,
            segmentAnalysis: true,
            abTesting: true,
            funnelAnalysis: true,
            heatmapsPlatform: true,
            dashboards: true,
            customReportsPlatform: true,
            scheduledReports: true,
            dataExport: true,
            biIntegration: true,

            // ====== Platform Security (25 features) ======
            platformAuthentication: true,
            ssoIntegration: true,
            oauth: true,
            oauthProviderPlatform: true,
            ldapIntegrationPlatform: true,
            activeDirectoryPlatform: true,
            twoFactorAuthPlatform: true,
            biometricAuth: true,
            passwordPolicy: true,
            sessionManagementPlatform: true,
            ipWhitelist: true,
            geoBlocking: true,
            ddosProtectionPlatform: true,
            malwareProtection: true,
            vulnerabilityScanning: true,
            penetrationTestingPlatform: true,
            securityAudits: true,
            complianceReporting: true,
            gdprCompliancePlatform: true,
            ccpaCompliance: true,
            hipaaCompliancePlatform: true,
            pciDssCompliancePlatform: true,
            soc2CompliancePlatform: true,
            iso27001Compliance: true,
            dataEncryption: true

        }
    }
};

// Helper functions
export const isPlanTier = (tier: string): tier is PlanTier => {
    return PLAN_TIERS.includes(tier as PlanTier);
};

export const getPlanByTier = (tier: string | null | undefined): PlanDefinition => {
    if (!tier || !isPlanTier(tier)) return PLATFORM_PLANS[DEFAULT_PLAN_TIER];
    return PLATFORM_PLANS[tier];
};

export const getPlanTierLabel = (tier: PlanTier): string => {
    return PLATFORM_PLANS[tier].label;
};

export const getPlanPrice = (tier: PlanTier): number => {
    return PLATFORM_PLANS[tier].monthlyPriceUsd;
};

export const getPlanLimits = (tier: PlanTier) => {
    return PLATFORM_PLANS[tier].limits;
};
