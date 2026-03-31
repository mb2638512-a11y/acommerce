const getRequiredEnv = (name: string): string => {
    const value = process.env[name];
    if (!value || value.trim() === '') {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
};

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const nodeEnv = process.env.NODE_ENV || 'development';
const adminDashboardEmail = normalizeEmail(process.env.ADMIN_DASHBOARD_EMAIL || '');
const corsOrigins = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

if (adminDashboardEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminDashboardEmail)) {
    throw new Error('ADMIN_DASHBOARD_EMAIL must be a valid email address');
}

if (nodeEnv === 'production' && !adminDashboardEmail) {
    throw new Error('ADMIN_DASHBOARD_EMAIL must be set in production');
}

if (nodeEnv === 'production' && corsOrigins.length === 0) {
    throw new Error('CORS_ORIGIN must be set in production');
}

export const env = {
    nodeEnv,
    port: Number(process.env.PORT || 5000),
    jwtSecret: getRequiredEnv('JWT_SECRET'),
    corsOrigins,
    adminDashboardEmail,
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    openRouterApiKey: process.env.OPENROUTER_API_KEY || '',
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
    stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    stripeConnectSecret: process.env.STRIPE_CONNECT_SECRET || process.env.STRIPE_SECRET_KEY || '',
    platformCommissionFree: Number(process.env.PLATFORM_COMMISSION_FREE || '0.05'),
    platformCommissionPro: Number(process.env.PLATFORM_COMMISSION_PRO || '0.02'),
    platformCommissionPremium: Number(process.env.PLATFORM_COMMISSION_PREMIUM || '0.01'),
    platformCommissionEnterprise: Number(process.env.PLATFORM_COMMISSION_ENTERPRISE || '0'),
    // Content Moderation Settings
    contentModerationEnabled: process.env.CONTENT_MODERATION_ENABLED === 'true',
    moderationStrictMode: process.env.MODERATION_STRICT_MODE === 'true',
    // SendGrid Email Settings
    sendgridApiKey: process.env.SENDGRID_API_KEY || '',
    fromEmail: process.env.FROM_EMAIL || 'noreply@aureon.com',
    fromName: process.env.FROM_NAME || 'Aureon',

    // EasyPost Shipping Settings
    easyPostApiKey: process.env.EASYPOST_API_KEY || '',
    easyPostTestApiKey: process.env.EASYPOST_TEST_API_KEY || '',
};

export const isProduction = env.nodeEnv === 'production';
