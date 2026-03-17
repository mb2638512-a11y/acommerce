import React, { useMemo, useState } from 'react';
import { User, PlanTier } from '../types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../src/lib/api';
import { useAuth } from '../src/context/AuthContext';
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Search,
  Trash2,
  Shield,
  Activity,
  Server,
  CheckCircle,
  Menu,
  X,
  LogOut,
  Package,
  Receipt,
  Power,
  Eye,
  DollarSign,
  Crown,
  UserRound,
  Store as StoreIcon,
  UserCog,
  Sparkles,
  Gift,
  Building2,
  Megaphone,
  Globe,
  Boxes,
  Languages,
  Bell,
  Tag,
  Calendar,
  Clock,
  BarChart3,
  UsersRound,
  FileText,
  CreditCard,
  PackagePlus,
  Target,
  Zap,
  Mail,
  MessageSquare,
  Palette,
  Bot,
  Brain,
  Video,
  TestTube,
  LineChart,
  Rocket
} from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { canAccessAdminDashboard } from '../src/lib/adminAccess';
import { ThemeToggle } from '../context/ThemeContext';

interface PlatformAdminProps {
  user: User | null;
  onNavigate: (p: string) => void;
  onLogout: () => void;
}

interface AdminStats {
  totalUsers: number;
  totalStores: number;
  activeStores: number;
  totalRevenue: number;
  totalOrders: number;
  premiumStores: number;
  planDistribution: Record<PlanTier, number>;
  systemHealth: string;
}

interface RevenuePoint {
  date: string;
  revenue: number;
}

interface SellerInsight {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  stores: number;
  totalRevenue: number;
  planMix: Record<PlanTier, number>;
}

interface ShopperInsight {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  orders: number;
  spend: number;
  isSeller: boolean;
}

interface AudienceResponse {
  sellers: SellerInsight[];
  shoppers: ShopperInsight[];
  summary: {
    sellerCount: number;
    activeShopperCount: number;
    highValueShoppers: number;
  };
}

type AdminOrder = {
  id: string;
  date: string;
  total: number;
  customerName: string;
  customerEmail: string;
  status: string;
  store?: { name: string };
};

type AdminProduct = {
  id: string;
  name: string;
  price: number;
  status: string;
  images: string[];
  store?: { name: string };
};

const PLAN_TIERS: PlanTier[] = ['STARTER', 'PRO', 'PREMIUM', 'ENTERPRISE'];
const CONTROL_CATEGORIES = [
  'Identity & Access',
  'Trust & Safety',
  'Payments & Payouts',
  'Fraud & Abuse',
  'Catalog Governance',
  'Order Orchestration',
  'Tax & Compliance',
  'Data Privacy',
  'Incident Response',
  'Growth & CRM',
  'AI Moderation',
  'Infrastructure & SRE'
] as const;
const CONTROL_STATUSES = ['Active', 'Pilot', 'Paused'] as const;
const CONTROL_RISKS = ['Low', 'Medium', 'High'] as const;
const CONTROL_OWNERS = [
  'Trust Ops',
  'Payments Core',
  'Security Core',
  'Risk Ops',
  'Catalog Integrity',
  'Platform SRE',
  'Data Governance',
  'Growth Systems'
];
const CONTROL_PREFIXES = [
  'Policy Engine',
  'Guardrail',
  'Sentinel',
  'Gateway',
  'Orchestrator',
  'Signal Mesh',
  'Auto Remediator',
  'Compliance Lock',
  'Audit Trail',
  'Risk Scanner'
];
const SLO_TARGETS = ['5m', '15m', '30m', '1h', '4h', '24h'];

type ControlCategory = (typeof CONTROL_CATEGORIES)[number];
type ControlStatus = (typeof CONTROL_STATUSES)[number];
type ControlRisk = (typeof CONTROL_RISKS)[number];
type AdminTab =
  | 'overview'
  | 'controls'
  | 'security'
  | 'finance'
  | 'growth'
  | 'automation'
  | 'compliance'
  | 'support'
  | 'risk'
  | 'sellers'
  | 'shoppers'
  | 'stores'
  | 'orders'
  | 'products'
  | 'system'
  | 'features';

interface PremiumControl {
  id: string;
  name: string;
  category: ControlCategory;
  owner: string;
  status: ControlStatus;
  risk: ControlRisk;
  coverage: number;
  automation: number;
  slaTarget: string;
  monthlyRunCost: number;
  description: string;
  lastUpdatedAt: string;
}

type FeatureCategory = 'Marketing & Sales' | 'Store Management' | 'Advanced Commerce' | 'Support & Branding' | 'AI Advanced' | 'Core Platform';

interface PremiumFeature {
  id: string;
  name: string;
  key: string;
  description: string;
  category: FeatureCategory;
  icon: string;
  tiers: PlanTier[];
  tooltip: string;
}

const PREMIUM_FEATURES: PremiumFeature[] = [
  // Marketing & Sales (8 features)
  { id: 'feat-01', name: 'Bulk Product Import', key: 'bulkProductImport', description: 'Import products via CSV/Excel', category: 'Marketing & Sales', icon: 'PackagePlus', tiers: ['PRO', 'PREMIUM', 'ENTERPRISE'], tooltip: 'Bulk import products from CSV or Excel files with automatic mapping and validation.' },
  { id: 'feat-02', name: 'Email Marketing', key: 'emailMarketing', description: 'Email campaign management', category: 'Marketing & Sales', icon: 'Mail', tiers: ['PRO', 'PREMIUM', 'ENTERPRISE'], tooltip: 'Create, schedule, and track email campaigns to engage your customers.' },
  { id: 'feat-03', name: 'Facebook Pixel', key: 'facebookPixel', description: 'Facebook Pixel integration', category: 'Marketing & Sales', icon: 'Target', tiers: ['PRO', 'PREMIUM', 'ENTERPRISE'], tooltip: 'Track conversions and optimize Facebook ad campaigns with pixel integration.' },
  { id: 'feat-04', name: 'Google Analytics', key: 'googleAnalytics', description: 'Google Analytics integration', category: 'Marketing & Sales', icon: 'BarChart3', tiers: ['PRO', 'PREMIUM', 'ENTERPRISE'], tooltip: 'Advanced analytics and e-commerce tracking with Google Analytics 4.' },
  { id: 'feat-05', name: 'Discount Automation', key: 'discountAutomation', description: 'Automated discount rules', category: 'Marketing & Sales', icon: 'Tag', tiers: ['PREMIUM', 'ENTERPRISE'], tooltip: 'Set up automatic discounts based on conditions like cart value, quantity, or customer tags.' },
  { id: 'feat-06', name: 'Loyalty Program', key: 'loyaltyProgram', description: 'Customer loyalty points system', category: 'Marketing & Sales', icon: 'Gift', tiers: ['PREMIUM', 'ENTERPRISE'], tooltip: 'Reward customers with points that can be redeemed for discounts or products.' },
  { id: 'feat-07', name: 'Flash Sales', key: 'flashSales', description: 'Time-limited sale events', category: 'Marketing & Sales', icon: 'Zap', tiers: ['PREMIUM', 'ENTERPRISE'], tooltip: 'Create urgency with countdown timers and limited-time offers.' },
  { id: 'feat-08', name: 'Push Notifications', key: 'pushNotifications', description: 'Web push notifications', category: 'Marketing & Sales', icon: 'Bell', tiers: ['PREMIUM', 'ENTERPRISE'], tooltip: 'Send browser notifications to re-engage visitors and drive conversions.' },

  // Store Management (6 features)
  { id: 'feat-09', name: 'Multi-Language', key: 'multiLanguage', description: 'Multiple language support', category: 'Store Management', icon: 'Languages', tiers: ['PRO', 'PREMIUM', 'ENTERPRISE'], tooltip: 'Translate your store into multiple languages to reach a global audience.' },
  { id: 'feat-10', name: 'POS Integration', key: 'posIntegration', description: 'Point of Sale integration', category: 'Store Management', icon: 'Building2', tiers: ['PREMIUM', 'ENTERPRISE'], tooltip: 'Integrate with popular POS systems for seamless online-offline inventory sync.' },
  { id: 'feat-11', name: 'Inventory Alerts', key: 'inventoryAlerts', description: 'Low stock notifications', category: 'Store Management', icon: 'Bell', tiers: ['PRO', 'PREMIUM', 'ENTERPRISE'], tooltip: 'Get notified when products fall below threshold levels.' },
  { id: 'feat-12', name: 'Product Variants', key: 'productVariants', description: 'Advanced product variants', category: 'Store Management', icon: 'Boxes', tiers: ['PRO', 'PREMIUM', 'ENTERPRISE'], tooltip: 'Create products with multiple options like size, color, and material.' },
  { id: 'feat-13', name: 'Bundle Products', key: 'bundleProducts', description: 'Product bundling', category: 'Store Management', icon: 'Package', tiers: ['PREMIUM', 'ENTERPRISE'], tooltip: 'Create product bundles to increase average order value.' },
  { id: 'feat-14', name: 'Seasonal Themes', key: 'seasonalThemes', description: 'Holiday/seasonal store themes', category: 'Store Management', icon: 'Palette', tiers: ['PREMIUM', 'ENTERPRISE'], tooltip: 'Automatically change your store theme for holidays and seasons.' },

  // Advanced Commerce (6 features)
  { id: 'feat-15', name: 'Membership Tiers', key: 'membershipTiers', description: 'Membership/subscription levels', category: 'Advanced Commerce', icon: 'Crown', tiers: ['PREMIUM', 'ENTERPRISE'], tooltip: 'Create subscription tiers with exclusive benefits and pricing.' },
  { id: 'feat-16', name: 'Gift Cards', key: 'giftCards', description: 'Digital gift cards', category: 'Advanced Commerce', icon: 'Gift', tiers: ['PREMIUM', 'ENTERPRISE'], tooltip: 'Sell digital gift cards that customers can redeem online.' },
  { id: 'feat-17', name: 'Booking System', key: 'bookingSystem', description: 'Appointment/booking functionality', category: 'Advanced Commerce', icon: 'Calendar', tiers: ['PREMIUM', 'ENTERPRISE'], tooltip: 'Allow customers to book appointments, services, or rentals.' },
  { id: 'feat-18', name: 'Waitlist', key: 'waitlist', description: 'Product waitlist for out-of-stock items', category: 'Advanced Commerce', icon: 'Clock', tiers: ['PRO', 'PREMIUM', 'ENTERPRISE'], tooltip: 'Let customers join a waitlist and get notified when items are back in stock.' },
  { id: 'feat-19', name: 'Pre-Orders', key: 'preOrders', description: 'Pre-order upcoming products', category: 'Advanced Commerce', icon: 'PackagePlus', tiers: ['PREMIUM', 'ENTERPRISE'], tooltip: 'Accept pre-orders for products not yet released or in stock.' },
  { id: 'feat-20', name: 'Wholesale Pricing', key: 'wholesalePricing', description: 'Wholesale tier pricing', category: 'Advanced Commerce', icon: 'Tag', tiers: ['ENTERPRISE'], tooltip: 'Offer bulk pricing tiers for wholesale customers.' },

  // Support & Branding (5 features)
  { id: 'feat-21', name: 'White-Label Branding', key: 'whiteLabelBranding', description: 'White-label solution', category: 'Support & Branding', icon: 'Building2', tiers: ['ENTERPRISE'], tooltip: 'Remove ACommerce branding and use your own custom domain and styling.' },
  { id: 'feat-22', name: 'API Access', key: 'apiAccess', description: 'Full API access', category: 'Support & Branding', icon: 'Server', tiers: ['PREMIUM', 'ENTERPRISE'], tooltip: 'Full programmatic access to manage your store via REST API.' },
  { id: 'feat-23', name: 'Custom Reports', key: 'customReports', description: 'Custom analytics reports', category: 'Support & Branding', icon: 'FileText', tiers: ['PREMIUM', 'ENTERPRISE'], tooltip: 'Create custom analytics reports with your own metrics and visualizations.' },
  { id: 'feat-24', name: 'Advanced Segmentation', key: 'advancedSegmentation', description: 'Customer segmentation', category: 'Support & Branding', icon: 'UsersRound', tiers: ['PREMIUM', 'ENTERPRISE'], tooltip: 'Segment customers by behavior, purchase history, and custom attributes.' },
  { id: 'feat-25', name: 'Audit Logs', key: 'auditLogs', description: 'Detailed activity logging', category: 'Support & Branding', icon: 'FileText', tiers: ['ENTERPRISE'], tooltip: 'Complete audit trail of all admin actions and system events.' },

  // AI Advanced Features (25 features)
  // AI Content Generation (features 1-6)
  { id: 'ai-01', name: 'AI Product Descriptions', key: 'aiProductDescriptions', description: 'AI-generated product descriptions', category: 'AI Advanced', icon: 'Bot', tiers: ['PRO', 'PREMIUM', 'ENTERPRISE'], tooltip: 'Automatically generate compelling product descriptions using AI.' },
  { id: 'ai-02', name: 'AI SEO Optimization', key: 'aiSeoOptimization', description: 'AI-powered SEO suggestions', category: 'AI Advanced', icon: 'Search', tiers: ['PRO', 'PREMIUM', 'ENTERPRISE'], tooltip: 'Get AI-powered SEO recommendations to improve search rankings.' },
  { id: 'ai-03', name: 'AI Content Translation', key: 'aiContentTranslation', description: 'Auto-translate content with AI', category: 'AI Advanced', icon: 'Languages', tiers: ['PRO', 'PREMIUM', 'ENTERPRISE'], tooltip: 'Automatically translate your content to multiple languages using AI.' },
  { id: 'ai-04', name: 'AI Blog Writing', key: 'aiBlogWriting', description: 'AI blog post generation', category: 'AI Advanced', icon: 'FileText', tiers: ['PRO', 'PREMIUM', 'ENTERPRISE'], tooltip: 'Generate blog posts and articles with AI assistance.' },
  { id: 'ai-05', name: 'AI Email Drafting', key: 'aiEmailDrafting', description: 'AI email campaign copy', category: 'AI Advanced', icon: 'Mail', tiers: ['PRO', 'PREMIUM', 'ENTERPRISE'], tooltip: 'Create email campaigns with AI-generated copy.' },
  { id: 'ai-06', name: 'AI Ad Copy', key: 'aiAdCopy', description: 'AI advertising copy generation', category: 'AI Advanced', icon: 'Megaphone', tiers: ['PRO', 'PREMIUM', 'ENTERPRISE'], tooltip: 'Generate high-converting ad copy with AI.' },

  // AI Customer Service (features 7-11)
  { id: 'ai-07', name: 'AI Chatbot', key: 'aiChatbot', description: 'AI-powered chatbot', category: 'AI Advanced', icon: 'MessageSquare', tiers: ['PRO', 'PREMIUM', 'ENTERPRISE'], tooltip: 'Deploy an AI-powered chatbot for 24/7 customer support.' },
  { id: 'ai-08', name: 'AI Voice Assistant', key: 'aiVoiceAssistant', description: 'Voice AI for customer service', category: 'AI Advanced', icon: 'Bot', tiers: ['PREMIUM', 'ENTERPRISE'], tooltip: 'Voice-enabled AI assistant for customer interactions.' },
  { id: 'ai-09', name: 'AI Sentiment Analysis', key: 'aiSentimentAnalysis', description: 'Analyze customer sentiment', category: 'AI Advanced', icon: 'Brain', tiers: ['PREMIUM', 'ENTERPRISE'], tooltip: 'Analyze customer feedback and sentiment using AI.' },
  { id: 'ai-10', name: 'AI Auto-Responder', key: 'aiAutoResponder', description: 'Smart auto-responses', category: 'AI Advanced', icon: 'Zap', tiers: ['PREMIUM', 'ENTERPRISE'], tooltip: 'AI-powered automatic responses to customer inquiries.' },
  { id: 'ai-11', name: 'AI Ticket Routing', key: 'aiTicketRouting', description: 'AI ticket categorization', category: 'AI Advanced', icon: 'Target', tiers: ['PREMIUM', 'ENTERPRISE'], tooltip: 'Automatically categorize and route support tickets with AI.' },

  // AI Analytics & Insights (features 12-16)
  { id: 'ai-12', name: 'AI Sales Forecasting', key: 'aiSalesForecasting', description: 'Predict future sales', category: 'AI Advanced', icon: 'LineChart', tiers: ['PREMIUM', 'ENTERPRISE'], tooltip: 'Predict future sales trends with AI-powered forecasting.' },
  { id: 'ai-13', name: 'AI Customer Insights', key: 'aiCustomerInsights', description: 'AI customer behavior analysis', category: 'AI Advanced', icon: 'Users', tiers: ['PREMIUM', 'ENTERPRISE'], tooltip: 'Get deep insights into customer behavior with AI.' },
  { id: 'ai-14', name: 'AI Churn Prediction', key: 'aiChurnPrediction', description: 'Predict customer churn', category: 'AI Advanced', icon: 'UserRound', tiers: ['PREMIUM', 'ENTERPRISE'], tooltip: 'Predict which customers are at risk of churning.' },
  { id: 'ai-15', name: 'AI Price Optimization', key: 'aiPriceOptimization', description: 'Dynamic AI pricing', category: 'AI Advanced', icon: 'DollarSign', tiers: ['PREMIUM', 'ENTERPRISE'], tooltip: 'Optimize pricing strategies with AI-powered dynamic pricing.' },
  { id: 'ai-16', name: 'AI Trend Detection', key: 'aiTrendDetection', description: 'Detect market trends', category: 'AI Advanced', icon: 'Activity', tiers: ['PREMIUM', 'ENTERPRISE'], tooltip: 'Detect emerging market trends with AI analysis.' },

  // AI Visual & Media (features 17-21)
  { id: 'ai-17', name: 'AI Image Generation', key: 'aiImageGeneration', description: 'Generate product images', category: 'AI Advanced', icon: 'Sparkles', tiers: ['PREMIUM', 'ENTERPRISE'], tooltip: 'Generate product images using AI.' },
  { id: 'ai-18', name: 'AI Image Enhancement', key: 'aiImageEnhancement', description: 'AI image optimization', category: 'AI Advanced', icon: 'Sparkles', tiers: ['PREMIUM', 'ENTERPRISE'], tooltip: 'Enhance and optimize product images with AI.' },
  { id: 'ai-19', name: 'AI Background Removal', key: 'aiBackgroundRemoval', description: 'Auto-remove backgrounds', category: 'AI Advanced', icon: 'Eye', tiers: ['ENTERPRISE'], tooltip: 'Automatically remove backgrounds from product images.' },
  { id: 'ai-20', name: 'AI Video Generation', key: 'aiVideoGeneration', description: 'AI video creation', category: 'AI Advanced', icon: 'Video', tiers: ['ENTERPRISE'], tooltip: 'Create product videos with AI.' },
  { id: 'ai-21', name: 'AI Virtual Try-On', key: 'aiVirtualTryOn', description: 'Virtual product try-on', category: 'AI Advanced', icon: 'UserCog', tiers: ['ENTERPRISE'], tooltip: 'Enable virtual try-on for products.' },

  // AI Marketing & Automation (features 22-25)
  { id: 'ai-22', name: 'AI Personalization', key: 'aiPersonalization', description: 'AI product recommendations', category: 'AI Advanced', icon: 'Target', tiers: ['ENTERPRISE'], tooltip: 'Personalized product recommendations powered by AI.' },
  { id: 'ai-23', name: 'AI Audience Segmentation', key: 'aiAudienceSegmentation', description: 'Smart audience targeting', category: 'AI Advanced', icon: 'UsersRound', tiers: ['ENTERPRISE'], tooltip: 'Smart audience segmentation with AI.' },
  { id: 'ai-24', name: 'AI Campaign Optimizer', key: 'aiCampaignOptimizer', description: 'Optimize marketing campaigns', category: 'AI Advanced', icon: 'Zap', tiers: ['ENTERPRISE'], tooltip: 'Optimize marketing campaigns with AI.' },
  { id: 'ai-25', name: 'AI A/B Testing', key: 'aiAbTesting', description: 'AI-powered A/B testing', category: 'AI Advanced', icon: 'TestTube', tiers: ['ENTERPRISE'], tooltip: 'AI-powered A/B testing for conversions.' },

  // Core Platform Features (25 features)
  // Payment Processing (features 1-5)
  { id: 'core-01', name: 'PayPal Integration', key: 'paypalIntegration', description: 'PayPal payment gateway', category: 'Core Platform', icon: 'CreditCard', tiers: ['PRO', 'PREMIUM', 'ENTERPRISE'], tooltip: 'Accept PayPal payments in your store.' },
  { id: 'core-02', name: 'Apple Pay', key: 'applePay', description: 'Apple Pay support', category: 'Core Platform', icon: 'CreditCard', tiers: ['PRO', 'PREMIUM', 'ENTERPRISE'], tooltip: 'Accept Apple Pay for seamless checkout.' },
  { id: 'core-03', name: 'Google Pay', key: 'googlePay', description: 'Google Pay support', category: 'Core Platform', icon: 'CreditCard', tiers: ['PRO', 'PREMIUM', 'ENTERPRISE'], tooltip: 'Accept Google Pay for quick checkout.' },
  { id: 'core-04', name: 'Buy Now Pay Later', key: 'buyNowPayLater', description: 'Installment payments (Klarna/Afterpay)', category: 'Core Platform', icon: 'CreditCard', tiers: ['PRO', 'PREMIUM', 'ENTERPRISE'], tooltip: 'Offer installment payment options through Klarna and Afterpay.' },
  { id: 'core-05', name: 'Multi-Currency', key: 'multiCurrency', description: 'Multi-currency checkout', category: 'Core Platform', icon: 'Globe', tiers: ['PRO', 'PREMIUM', 'ENTERPRISE'], tooltip: 'Accept payments in multiple currencies.' },

  // Shipping & Fulfillment (features 6-10)
  { id: 'core-06', name: 'Multiple Carriers', key: 'multipleCarriers', description: 'Multiple shipping carriers (UPS, FedEx, DHL)', category: 'Core Platform', icon: 'Package', tiers: ['PRO', 'PREMIUM', 'ENTERPRISE'], tooltip: 'Integrate with multiple shipping carriers.' },
  { id: 'core-07', name: 'Shipping Labels', key: 'shippingLabels', description: 'Generate shipping labels', category: 'Core Platform', icon: 'Package', tiers: ['PRO', 'PREMIUM', 'ENTERPRISE'], tooltip: 'Generate and print shipping labels directly from your store.' },
  { id: 'core-08', name: 'Shipment Tracking', key: 'shipmentTracking', description: 'Real-time tracking', category: 'Core Platform', icon: 'Package', tiers: ['PRO', 'PREMIUM', 'ENTERPRISE'], tooltip: 'Provide real-time shipment tracking to customers.' },
  { id: 'core-09', name: 'Free Shipping', key: 'freeShipping', description: 'Free shipping rules', category: 'Core Platform', icon: 'Package', tiers: ['PREMIUM', 'ENTERPRISE'], tooltip: 'Set up free shipping rules based on order value or products.' },
  { id: 'core-10', name: 'Local Pickup', key: 'localPickup', description: 'In-store pickup option', category: 'Core Platform', icon: 'Package', tiers: ['PREMIUM', 'ENTERPRISE'], tooltip: 'Allow customers to pick up orders at your physical location.' },

  // Tax & Compliance (features 11-13)
  { id: 'core-11', name: 'Automatic Tax', key: 'automaticTax', description: 'Auto tax calculation', category: 'Core Platform', icon: 'Receipt', tiers: ['PRO', 'PREMIUM', 'ENTERPRISE'], tooltip: 'Automatically calculate taxes based on customer location.' },
  { id: 'core-12', name: 'VAT Handling', key: 'vatHandling', description: 'VAT/GST handling', category: 'Core Platform', icon: 'Receipt', tiers: ['PREMIUM', 'ENTERPRISE'], tooltip: 'Handle VAT and GST calculations for international sales.' },
  { id: 'core-13', name: 'Tax Reports', key: 'taxReports', description: 'Tax reporting', category: 'Core Platform', icon: 'FileText', tiers: ['PREMIUM', 'ENTERPRISE'], tooltip: 'Generate tax reports for compliance and filing.' },

  // Order Management (features 14-17)
  { id: 'core-14', name: 'Partial Refunds', key: 'partialRefunds', description: 'Partial refund support', category: 'Core Platform', icon: 'Receipt', tiers: ['PREMIUM', 'ENTERPRISE'], tooltip: 'Issue partial refunds for orders.' },
  { id: 'core-15', name: 'Packing Slips', key: 'packingSlips', description: 'Packing slip generation', category: 'Core Platform', icon: 'FileText', tiers: ['PREMIUM', 'ENTERPRISE'], tooltip: 'Generate packing slips for orders.' },
  { id: 'core-16', name: 'Order Export', key: 'orderExport', description: 'Export orders to CSV/Excel', category: 'Core Platform', icon: 'FileText', tiers: ['PREMIUM', 'ENTERPRISE'], tooltip: 'Export orders to CSV or Excel files.' },
  { id: 'core-17', name: 'Return Management', key: 'returnManagement', description: 'Return merchandise authorization', category: 'Core Platform', icon: 'Package', tiers: ['PREMIUM', 'ENTERPRISE'], tooltip: 'Manage product returns with RMA functionality.' },

  // Security & Compliance (features 18-20)
  { id: 'core-18', name: 'Two-Factor Auth', key: 'twoFactorAuth', description: 'Two-factor authentication', category: 'Core Platform', icon: 'Shield', tiers: ['PREMIUM', 'ENTERPRISE'], tooltip: 'Add an extra layer of security with 2FA.' },
  { id: 'core-19', name: 'GDPR Compliance', key: 'gdprCompliance', description: 'GDPR tools', category: 'Core Platform', icon: 'Shield', tiers: ['ENTERPRISE'], tooltip: 'GDPR compliance tools including data export and deletion requests.' },
  { id: 'core-20', name: 'Session Management', key: 'sessionManagement', description: 'Admin session management', category: 'Core Platform', icon: 'Shield', tiers: ['ENTERPRISE'], tooltip: 'Manage admin sessions and access control.' },

  // Third-party Integrations (features 21-25)
  { id: 'core-21', name: 'QuickBooks Integration', key: 'quickbooksIntegration', description: 'QuickBooks accounting', category: 'Core Platform', icon: 'Server', tiers: ['ENTERPRISE'], tooltip: 'Integrate with QuickBooks for accounting.' },
  { id: 'core-22', name: 'Zendesk Integration', key: 'zendeskIntegration', description: 'Zendesk support', category: 'Core Platform', icon: 'MessageSquare', tiers: ['ENTERPRISE'], tooltip: 'Integrate with Zendesk for customer support.' },
  { id: 'core-23', name: 'Slack Integration', key: 'slackIntegration', description: 'Slack notifications', category: 'Core Platform', icon: 'MessageSquare', tiers: ['ENTERPRISE'], tooltip: 'Send notifications to Slack channels.' },
  { id: 'core-24', name: 'Amazon Channel', key: 'marketplaceAmazon', description: 'Amazon marketplace', category: 'Core Platform', icon: 'Store', tiers: ['ENTERPRISE'], tooltip: 'List products on Amazon marketplace.' },
  { id: 'core-25', name: 'eBay Channel', key: 'marketplaceEbay', description: 'eBay marketplace', category: 'Core Platform', icon: 'Store', tiers: ['ENTERPRISE'], tooltip: 'List products on eBay marketplace.' },
];

const FEATURE_CATEGORIES: FeatureCategory[] = ['Marketing & Sales', 'Store Management', 'Advanced Commerce', 'Support & Branding', 'AI Advanced', 'Core Platform'];

const AdminAreaChart: React.FC<{ data: RevenuePoint[] }> = ({ data }) => {
  if (!data.length) return <div className="h-full flex items-center justify-center text-gray-900 dark:text-gray-500 dark:text-white/50">No analytics yet</div>;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="adminRevenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.6} />
            <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1f" vertical={false} />
        <XAxis dataKey="date" stroke="#ffffff70" fontSize={11} tickFormatter={(value) => value.slice(5)} />
        <YAxis stroke="#ffffff70" fontSize={11} tickFormatter={(value) => `$${value}`} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(3, 7, 18, 0.9)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12
          }}
          formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
        />
        <Area type="monotone" dataKey="revenue" stroke="#38bdf8" strokeWidth={3} fill="url(#adminRevenueFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value || 0);

const resolveStorePlan = (store: { planTier?: PlanTier; settings?: { subscription?: { tier?: PlanTier } } }): PlanTier => {
  const tier = store.planTier || store.settings?.subscription?.tier || 'STARTER';
  return PLAN_TIERS.includes(tier) ? tier : 'STARTER';
};

const planBadgeClass = (tier: PlanTier) => {
  if (tier === 'ENTERPRISE') return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
  if (tier === 'PREMIUM') return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
  if (tier === 'PRO') return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
  return 'bg-gray-500/15 text-gray-300 border-gray-500/30';
};

const controlStatusClass = (status: ControlStatus) => {
  if (status === 'Active') return 'text-emerald-300 border-emerald-400/40 bg-emerald-500/10';
  if (status === 'Pilot') return 'text-cyan-300 border-cyan-400/40 bg-cyan-500/10';
  return 'text-amber-300 border-amber-400/40 bg-amber-500/10';
};

const controlRiskClass = (risk: ControlRisk) => {
  if (risk === 'High') return 'text-rose-300 border-rose-400/40 bg-rose-500/10';
  if (risk === 'Medium') return 'text-amber-300 border-amber-400/40 bg-amber-500/10';
  return 'text-emerald-300 border-emerald-400/40 bg-emerald-500/10';
};

const toDateLabel = (iso: string) => new Date(iso).toLocaleDateString();
const toDateTimeLabel = (iso: string) => new Date(iso).toLocaleString();

const generatePremiumControls = (): PremiumControl[] => {
  const controls: PremiumControl[] = [];
  let sequence = 1;

  CONTROL_CATEGORIES.forEach((category, categoryIndex) => {
    for (let controlIndex = 0; controlIndex < 45; controlIndex += 1) {
      const status = CONTROL_STATUSES[(controlIndex + categoryIndex) % CONTROL_STATUSES.length];
      const risk = CONTROL_RISKS[(controlIndex * 2 + categoryIndex) % CONTROL_RISKS.length];
      const prefix = CONTROL_PREFIXES[(controlIndex + categoryIndex) % CONTROL_PREFIXES.length];
      const owner = CONTROL_OWNERS[(controlIndex + categoryIndex * 2) % CONTROL_OWNERS.length];
      const coverage = 64 + ((controlIndex * 7 + categoryIndex * 3) % 36);
      const automation = 48 + ((controlIndex * 5 + categoryIndex * 4) % 52);
      const slaTarget = SLO_TARGETS[(controlIndex + categoryIndex) % SLO_TARGETS.length];
      const monthlyRunCost = 220 + categoryIndex * 80 + controlIndex * 11;
      const lastUpdatedAt = new Date(Date.now() - (controlIndex + categoryIndex * 4) * 86400000).toISOString();
      const categoryCode = category
        .split(' ')
        .map((part) => part[0])
        .join('')
        .replace(/[^A-Z]/gi, '')
        .toUpperCase();

      controls.push({
        id: `ctl-${String(sequence).padStart(4, '0')}`,
        name: `${prefix} ${categoryCode}-${String(controlIndex + 1).padStart(2, '0')}`,
        category,
        owner,
        status,
        risk,
        coverage,
        automation,
        slaTarget,
        monthlyRunCost,
        description: `${category} enforcement path with adaptive fallback and governed escalation.`,
        lastUpdatedAt
      });
      sequence += 1;
    }
  });

  return controls;
};

export const PlatformAdmin: React.FC<PlatformAdminProps> = ({ onNavigate, onLogout }) => {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [search, setSearch] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [controlCategoryFilter, setControlCategoryFilter] = useState<'ALL' | ControlCategory>('ALL');
  const [controlStatusFilter, setControlStatusFilter] = useState<'ALL' | ControlStatus>('ALL');
  const [controlRiskFilter, setControlRiskFilter] = useState<'ALL' | ControlRisk>('ALL');
  const [selectedControlIds, setSelectedControlIds] = useState<string[]>([]);
  const [featureCategoryFilter, setFeatureCategoryFilter] = useState<'ALL' | FeatureCategory>('ALL');
  const [featureTierFilter, setFeatureTierFilter] = useState<'ALL' | PlanTier>('ALL');

  const { data: stats, isLoading: isStatsLoading, isError: isStatsError } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const res = await api.get<AdminStats>('/admin/stats');
      return res.data;
    },
    enabled: !!user
  });

  const { data: allUsers = [], isLoading: isUsersLoading, isError: isUsersError } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const res = await api.get<User[]>('/admin/users');
      return res.data;
    },
    enabled: !!user
  });

  const { data: allStores = [], isLoading: isStoresLoading, isError: isStoresError } = useQuery({
    queryKey: ['adminStores'],
    queryFn: async () => {
      const res = await api.get<any[]>('/admin/stores');
      return res.data;
    },
    enabled: !!user
  });

  const { data: revenueData = [], isLoading: isRevenueLoading, isError: isRevenueError } = useQuery({
    queryKey: ['adminRevenue'],
    queryFn: async () => {
      const res = await api.get<RevenuePoint[]>('/admin/analytics/revenue');
      return res.data;
    },
    enabled: !!user
  });

  const { data: audience, isLoading: isAudienceLoading, isError: isAudienceError } = useQuery({
    queryKey: ['adminAudience'],
    queryFn: async () => {
      const res = await api.get<AudienceResponse>('/admin/audience');
      return res.data;
    },
    enabled: !!user
  });

  const { data: allOrders = [], isLoading: isOrdersLoading, isError: isOrdersError } = useQuery({
    queryKey: ['adminOrders'],
    queryFn: async () => {
      const res = await api.get<AdminOrder[]>('/admin/orders');
      return res.data;
    },
    enabled: !!user
  });

  const { data: allProducts = [], isLoading: isProductsLoading, isError: isProductsError } = useQuery({
    queryKey: ['adminProducts'],
    queryFn: async () => {
      const res = await api.get<AdminProduct[]>('/admin/products');
      return res.data;
    },
    enabled: !!user
  });

  const isLoadingAdmin =
    isStatsLoading ||
    isUsersLoading ||
    isStoresLoading ||
    isRevenueLoading ||
    isAudienceLoading ||
    isOrdersLoading ||
    isProductsLoading;
  const isAdminDataError =
    isStatsError ||
    isUsersError ||
    isStoresError ||
    isRevenueError ||
    isAudienceError ||
    isOrdersError ||
    isProductsError ||
    !stats;

  const premiumControls = useMemo(() => generatePremiumControls(), []);

  const automationFlows = useMemo(
    () => [
      { id: 'wf-01', workflow: 'Seller Risk Re-Scoring', owner: 'Risk Ops', status: 'Healthy', successRate: 99.3, avgDurationSec: 84, lastRunAt: '2026-02-24T10:30:00Z' },
      { id: 'wf-02', workflow: 'Payout Delay Guard', owner: 'Payments Core', status: 'Healthy', successRate: 99.8, avgDurationSec: 63, lastRunAt: '2026-02-24T10:27:00Z' },
      { id: 'wf-03', workflow: 'Catalog Policy Sweep', owner: 'Catalog Integrity', status: 'Maintenance', successRate: 97.2, avgDurationSec: 121, lastRunAt: '2026-02-24T10:16:00Z' },
      { id: 'wf-04', workflow: 'Abuse Incident Auto-Triage', owner: 'Security Core', status: 'Degraded', successRate: 93.4, avgDurationSec: 159, lastRunAt: '2026-02-24T10:11:00Z' }
    ],
    []
  );

  const complianceBoards = useMemo(
    () => [
      { id: 'cmp-01', framework: 'SOC 2 Type II', owner: 'Security Core', coverage: 96, openFindings: 2, status: 'On Track' },
      { id: 'cmp-02', framework: 'PCI DSS', owner: 'Payments Core', coverage: 92, openFindings: 5, status: 'Needs Attention' },
      { id: 'cmp-03', framework: 'GDPR', owner: 'Data Governance', coverage: 95, openFindings: 3, status: 'On Track' },
      { id: 'cmp-04', framework: 'ISO 27001', owner: 'Security Core', coverage: 88, openFindings: 9, status: 'Delayed' }
    ],
    []
  );

  const riskIncidents = useMemo(
    () => [
      { id: 'inc-2201', stream: 'Payout Risk', title: 'High velocity payout anomaly detected', severity: 'High', impactedStores: 6, status: 'Monitoring', owner: 'Payments Core', createdAt: '2026-02-24T09:44:00Z' },
      { id: 'inc-2202', stream: 'Catalog Abuse', title: 'Counterfeit keyword burst in listing uploads', severity: 'Critical', impactedStores: 14, status: 'Open', owner: 'Trust Ops', createdAt: '2026-02-24T08:22:00Z' },
      { id: 'inc-2203', stream: 'Privacy', title: 'Suspicious data export attempt blocked', severity: 'High', impactedStores: 2, status: 'Mitigated', owner: 'Security Core', createdAt: '2026-02-23T23:10:00Z' }
    ],
    []
  );

  const supportQueue = useMemo(
    () => [
      { id: 'sup-01', channel: 'Live Chat', region: 'NA', queueDepth: 43, avgFirstResponseMin: 2.8, slaAtRisk: 4 },
      { id: 'sup-02', channel: 'Live Chat', region: 'EU', queueDepth: 28, avgFirstResponseMin: 3.1, slaAtRisk: 2 },
      { id: 'sup-03', channel: 'Email', region: 'Global', queueDepth: 126, avgFirstResponseMin: 18.2, slaAtRisk: 12 },
      { id: 'sup-04', channel: 'Priority Call', region: 'Enterprise', queueDepth: 7, avgFirstResponseMin: 1.2, slaAtRisk: 1 }
    ],
    []
  );

  const growthPrograms = useMemo(
    () => [
      { id: 'gth-01', name: 'Premium Seller Conversion', reach: 4200, impact: '+7.2% upgrade rate', status: 'Live' },
      { id: 'gth-02', name: 'Dormant Shopper Reactivation', reach: 11800, impact: '+4.1% repeat orders', status: 'Live' },
      { id: 'gth-03', name: 'Cross-Border Checkout Lift', reach: 9300, impact: '+3.5% completion', status: 'Pilot' }
    ],
    []
  );

  const usersById = useMemo(() => {
    const map = new Map<string, User>();
    for (const item of allUsers) map.set(item.id, item);
    return map;
  }, [allUsers]);

  const deleteStoreMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/stores/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminStores'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      queryClient.invalidateQueries({ queryKey: ['adminAudience'] });
      showToast('Store deleted.', 'success');
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      queryClient.invalidateQueries({ queryKey: ['adminAudience'] });
      showToast('User deleted.', 'success');
    }
  });

  const toggleRoleMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/users/${id}/role`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminAudience'] });
      showToast('User role updated.', 'success');
    }
  });

  const toggleMaintenanceMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/stores/${id}/maintenance`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminStores'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      showToast('Store status updated.', 'success');
    }
  });

  const updateStorePlanMutation = useMutation({
    mutationFn: ({ id, tier }: { id: string; tier: PlanTier }) => api.patch(`/admin/stores/${id}/plan`, { tier }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminStores'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      queryClient.invalidateQueries({ queryKey: ['adminAudience'] });
      showToast('Store plan updated.', 'success');
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      showToast('Product deleted.', 'success');
    }
  });

  if (isLoadingAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#07070d] text-gray-900 dark:text-white flex items-center justify-center">
        <div className="text-center">
          <Shield className="mx-auto mb-3 animate-pulse" />
          <p className="font-bold tracking-wider uppercase text-sm text-gray-900 dark:text-gray-600 dark:text-white/70">Loading Global Control Center</p>
        </div>
      </div>
    );
  }

  if (isAdminDataError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#07070d] text-gray-900 dark:text-white flex items-center justify-center">
        <div className="text-center">
          <Shield className="mx-auto mb-3 text-rose-300" />
          <p className="font-bold tracking-wider uppercase text-sm text-rose-200">Failed to load platform data</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!canAccessAdminDashboard(user)) {
    return <Navigate to="/dashboard" replace />;
  }

  const safeStats = stats as AdminStats;
  const sellers = audience?.sellers || [];
  const shoppers = audience?.shoppers || [];
  const searchLower = search.toLowerCase();

  const filteredSellers = sellers.filter((seller) =>
    `${seller.name} ${seller.email}`.toLowerCase().includes(searchLower)
  );
  const filteredShoppers = shoppers.filter((shopper) =>
    `${shopper.name} ${shopper.email}`.toLowerCase().includes(searchLower)
  );
  const filteredStores = allStores.filter((store) => store.name.toLowerCase().includes(searchLower));
  const filteredOrders = allOrders.filter(
    (order) =>
      `${order.customerName} ${order.customerEmail} ${order.store?.name || ''}`.toLowerCase().includes(searchLower)
  );
  const filteredProducts = allProducts.filter((product) =>
    `${product.name} ${product.store?.name || ''}`.toLowerCase().includes(searchLower)
  );

  const filteredControls = premiumControls.filter((control) => {
    const searchMatch = `${control.id} ${control.name} ${control.category} ${control.owner} ${control.description}`
      .toLowerCase()
      .includes(searchLower);
    const categoryMatch = controlCategoryFilter === 'ALL' || control.category === controlCategoryFilter;
    const statusMatch = controlStatusFilter === 'ALL' || control.status === controlStatusFilter;
    const riskMatch = controlRiskFilter === 'ALL' || control.risk === controlRiskFilter;
    return searchMatch && categoryMatch && statusMatch && riskMatch;
  });

  const filteredFeatures = PREMIUM_FEATURES.filter((feature) => {
    const searchMatch = `${feature.name} ${feature.description} ${feature.category}`.toLowerCase().includes(searchLower);
    const categoryMatch = featureCategoryFilter === 'ALL' || feature.category === featureCategoryFilter;
    const tierMatch = featureTierFilter === 'ALL' || feature.tiers.includes(featureTierFilter);
    return searchMatch && categoryMatch && tierMatch;
  });

  const featureSummary = useMemo(() => {
    const total = PREMIUM_FEATURES.length;
    const starter = PREMIUM_FEATURES.filter(f => f.tiers.length === 0 || f.tiers.includes('STARTER')).length;
    const pro = PREMIUM_FEATURES.filter(f => f.tiers.includes('PRO')).length;
    const premium = PREMIUM_FEATURES.filter(f => f.tiers.includes('PREMIUM')).length;
    const enterprise = PREMIUM_FEATURES.filter(f => f.tiers.includes('ENTERPRISE')).length;
    return { total, starter, pro, premium, enterprise };
  }, []);

  const visibleControlIds = useMemo(() => filteredControls.map((control) => control.id), [filteredControls]);
  const visibleControlIdSet = useMemo(() => new Set(visibleControlIds), [visibleControlIds]);
  const selectedVisibleCount = selectedControlIds.filter((id) => visibleControlIdSet.has(id)).length;
  const allVisibleSelected = filteredControls.length > 0 && selectedVisibleCount === filteredControls.length;

  const controlSummary = useMemo(() => {
    const total = premiumControls.length;
    const active = premiumControls.filter((entry) => entry.status === 'Active').length;
    const pilot = premiumControls.filter((entry) => entry.status === 'Pilot').length;
    const paused = premiumControls.filter((entry) => entry.status === 'Paused').length;
    const highRisk = premiumControls.filter((entry) => entry.risk === 'High').length;
    const avgCoverage = Math.round(
      premiumControls.reduce((sum, entry) => sum + entry.coverage, 0) / Math.max(1, total)
    );
    const avgAutomation = Math.round(
      premiumControls.reduce((sum, entry) => sum + entry.automation, 0) / Math.max(1, total)
    );
    const monthlyRunCost = premiumControls.reduce((sum, entry) => sum + entry.monthlyRunCost, 0);
    return { total, active, pilot, paused, highRisk, avgCoverage, avgAutomation, monthlyRunCost };
  }, [premiumControls]);

  const automationSummary = useMemo(() => {
    const healthy = automationFlows.filter((flow) => flow.status === 'Healthy').length;
    const degraded = automationFlows.filter((flow) => flow.status === 'Degraded').length;
    const maintenance = automationFlows.filter((flow) => flow.status === 'Maintenance').length;
    const avgSuccessRate = Math.round(
      (automationFlows.reduce((sum, flow) => sum + flow.successRate, 0) / Math.max(1, automationFlows.length)) * 10
    ) / 10;
    return { healthy, degraded, maintenance, avgSuccessRate };
  }, [automationFlows]);

  const complianceCoverage = Math.round(
    complianceBoards.reduce((sum, board) => sum + board.coverage, 0) / Math.max(1, complianceBoards.length)
  );

  const supportSummary = useMemo(() => {
    const queueDepth = supportQueue.reduce((sum, item) => sum + item.queueDepth, 0);
    const slaAtRisk = supportQueue.reduce((sum, item) => sum + item.slaAtRisk, 0);
    const avgFirstResponse = Math.round(
      (supportQueue.reduce((sum, item) => sum + item.avgFirstResponseMin, 0) / supportQueue.length) * 10
    ) / 10;
    return { queueDepth, slaAtRisk, avgFirstResponse };
  }, [supportQueue]);

  const platformTakeRate = 12.4;
  const netRevenue = Math.round(safeStats.totalRevenue * (platformTakeRate / 100));

  const handleDeleteUser = (id: string) => {
    if (confirm('Delete this account and linked platform data?')) deleteUserMutation.mutate(id);
  };
  const handleDeleteStore = (id: string) => {
    if (confirm('Delete this store and all associated records?')) deleteStoreMutation.mutate(id);
  };
  const handleDeleteProduct = (id: string) => {
    if (confirm('Delete this product globally?')) deleteProductMutation.mutate(id);
  };
  const handleLogout = () => {
    if (typeof logout === 'function') logout();
    if (typeof onLogout === 'function') onLogout();
  };
  const toggleControlSelection = (id: string) => {
    setSelectedControlIds((previous) =>
      previous.includes(id) ? previous.filter((entry) => entry !== id) : [...previous, id]
    );
  };

  const toggleSelectVisibleControls = () => {
    if (allVisibleSelected) {
      setSelectedControlIds((previous) => previous.filter((id) => !visibleControlIdSet.has(id)));
      return;
    }
    setSelectedControlIds((previous) => Array.from(new Set([...previous, ...visibleControlIds])));
  };

  const runBulkControlAction = (actionLabel: string) => {
    if (!selectedControlIds.length) {
      showToast('Select controls first.', 'warning');
      return;
    }
    showToast(`${actionLabel} queued for ${selectedControlIds.length} controls.`, 'success');
    setSelectedControlIds([]);
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'controls', label: 'Control Matrix', icon: Shield },
    { id: 'automation', label: 'Automation', icon: Activity },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'finance', label: 'Finance', icon: DollarSign },
    { id: 'growth', label: 'Growth', icon: Crown },
    { id: 'compliance', label: 'Compliance', icon: CheckCircle },
    { id: 'support', label: 'Support', icon: Users },
    { id: 'risk', label: 'Risk', icon: Server },
    { id: 'sellers', label: 'Sellers', icon: UserCog },
    { id: 'shoppers', label: 'Shoppers', icon: UserRound },
    { id: 'stores', label: 'Stores', icon: StoreIcon },
    { id: 'orders', label: 'Orders', icon: Receipt },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'system', label: 'System', icon: Server },
    { id: 'features', label: 'Premium Features', icon: Sparkles },
    { id: 'autopilot', label: 'Auto Pilot', icon: Rocket }
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#07070d] text-gray-900 dark:text-white flex">
      <aside
        className={`fixed lg:relative inset-y-0 left-0 z-50 w-80 bg-white dark:bg-[#0f111a]/95 backdrop-blur-xl border-r border-gray-200 dark:border-white/10 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        <div className="px-6 py-6 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-300 font-black">Global Owner Console</p>
            <h1 className="text-xl font-black">ACommerce Prime Orbit</h1>
            <p className="text-[11px] text-gray-900 dark:text-gray-500 dark:text-white/50 mt-1">{controlSummary.total} governance controls live</p>
          </div>
          <button className="lg:hidden text-gray-900 dark:text-gray-600 dark:text-white/70" onClick={() => setIsSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive ? 'bg-cyan-500/20 border border-cyan-400/30 text-cyan-200' : 'text-gray-900 dark:text-gray-600 dark:text-white/70 hover:bg-gray-100 dark:hover:bg-white/10'
                  }`}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-white/10 mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 py-3 text-sm font-bold text-rose-300 hover:bg-rose-500/20"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 bg-gray-50 dark:bg-[#07070d]/90 backdrop-blur-lg border-b border-gray-200 dark:border-white/10 px-4 md:px-8 h-16 flex items-center justify-between gap-3">
          <button className="lg:hidden text-gray-900 dark:text-gray-700 dark:text-white/80" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <div className="relative w-full max-w-xl">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-900 dark:text-gray-500 dark:text-white/50" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search controls, users, stores, orders, products..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#131827] border border-gray-200 dark:border-white/10 text-sm outline-none focus:border-cyan-400/50"
            />
          </div>
          <div className="text-xs text-gray-900 dark:text-gray-500 dark:text-white/60 uppercase tracking-widest font-bold hidden md:flex items-center gap-3">
            <ThemeToggle />
            <span className="text-emerald-300">{safeStats.systemHealth}</span>
            <span className="text-cyan-300">{controlSummary.total} Controls</span>
          </div>
        </header>

        <div className="p-4 md:p-8 space-y-8">
          {activeTab === 'overview' && (
            <div className="space-y-6 lg:space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4 lg:gap-6">
                {[
                  { label: 'GMV', value: formatCurrency(safeStats.totalRevenue), icon: DollarSign, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
                  { label: 'Stores', value: safeStats.totalStores.toLocaleString(), icon: StoreIcon, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
                  { label: 'Orders', value: safeStats.totalOrders.toLocaleString(), icon: Receipt, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
                  { label: 'Users', value: safeStats.totalUsers.toLocaleString(), icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
                  { label: 'Premium Stores', value: safeStats.premiumStores.toLocaleString(), icon: Crown, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
                  { label: 'Controls', value: controlSummary.total.toLocaleString(), icon: Shield, color: 'text-blue-300', bg: 'bg-blue-500/10', border: 'border-blue-500/20' }
                ].map((stat, i) => (
                  <div key={i} className={`p-5 rounded-2xl border ${stat.border} ${stat.bg} backdrop-blur-sm`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 rounded-xl bg-gray-100 dark:bg-[#0a0f1a] shadow-inner">
                        <stat.icon size={18} className={stat.color} />
                      </div>
                    </div>
                    <p className="text-xs font-bold text-gray-900 dark:text-gray-500 dark:text-white/50 mb-1 uppercase tracking-wider">{stat.label}</p>
                    <h3 className="text-2xl font-black tracking-tight">{stat.value}</h3>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                <div className="lg:col-span-2 p-6 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f111a]/50">
                  <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                    <Activity className="text-cyan-400" size={18} /> Network Volume
                  </h3>
                  <div className="h-72">
                    <AdminAreaChart data={revenueData} />
                  </div>
                </div>

                <div className="p-6 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f111a]/50 flex flex-col">
                  <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                    <Crown className="text-amber-400" size={18} /> Plan Distribution
                  </h3>
                  <div className="flex-1 space-y-4">
                    {PLAN_TIERS.map((tier) => (
                      <div key={tier} className="flex items-center justify-between p-3 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                        <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${planBadgeClass(tier)}`}>
                          {tier}
                        </span>
                        <span className="font-black text-lg">{safeStats.planDistribution[tier] || 0}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121827] p-5">
                  <p className="text-xs text-gray-900 dark:text-gray-500 dark:text-white/50 uppercase tracking-wider mb-2">Active Controls</p>
                  <p className="text-3xl font-black text-emerald-300">{controlSummary.active}</p>
                  <p className="text-xs text-gray-900 dark:text-gray-500 dark:text-white/50 mt-2">Pilot {controlSummary.pilot} | Paused {controlSummary.paused}</p>
                </div>
                <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121827] p-5">
                  <p className="text-xs text-gray-900 dark:text-gray-500 dark:text-white/50 uppercase tracking-wider mb-2">Average Coverage</p>
                  <p className="text-3xl font-black text-cyan-300">{controlSummary.avgCoverage}%</p>
                  <p className="text-xs text-gray-900 dark:text-gray-500 dark:text-white/50 mt-2">Policy + operational surface</p>
                </div>
                <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121827] p-5">
                  <p className="text-xs text-gray-900 dark:text-gray-500 dark:text-white/50 uppercase tracking-wider mb-2">Automation Rate</p>
                  <p className="text-3xl font-black text-blue-300">{controlSummary.avgAutomation}%</p>
                  <p className="text-xs text-gray-900 dark:text-gray-500 dark:text-white/50 mt-2">{automationSummary.healthy} healthy workflows</p>
                </div>
                <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121827] p-5">
                  <p className="text-xs text-gray-900 dark:text-gray-500 dark:text-white/50 uppercase tracking-wider mb-2">Control Opex</p>
                  <p className="text-3xl font-black text-amber-300">{formatCurrency(controlSummary.monthlyRunCost)}</p>
                  <p className="text-xs text-gray-900 dark:text-gray-500 dark:text-white/50 mt-2">Estimated monthly run cost</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'controls' && (
            <div className="space-y-4 animate-fade-in">
              <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121827] p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="font-black text-lg">Premium Control Matrix</h3>
                    <p className="text-sm text-gray-900 dark:text-gray-500 dark:text-white/60 mt-1">
                      540 controls across security, monetization, operations, compliance, and trust.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                    <div className="rounded-lg border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 px-3 py-2">
                      <p className="text-gray-900 dark:text-gray-500 dark:text-white/60">Total</p>
                      <p className="font-black text-cyan-300">{controlSummary.total}</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 px-3 py-2">
                      <p className="text-gray-900 dark:text-gray-500 dark:text-white/60">Filtered</p>
                      <p className="font-black">{filteredControls.length}</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 px-3 py-2">
                      <p className="text-gray-900 dark:text-gray-500 dark:text-white/60">Selected</p>
                      <p className="font-black text-amber-300">{selectedControlIds.length}</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 px-3 py-2">
                      <p className="text-gray-900 dark:text-gray-500 dark:text-white/60">High Risk</p>
                      <p className="font-black text-rose-300">{controlSummary.highRisk}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121827] p-5">
                <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-3">
                  <label className="text-xs">
                    <span className="block mb-1 text-gray-900 dark:text-gray-500 dark:text-white/60">Category</span>
                    <select
                      value={controlCategoryFilter}
                      onChange={(event) => setControlCategoryFilter(event.target.value as 'ALL' | ControlCategory)}
                      className="w-full bg-[#0b1020] border border-white/20 rounded-md px-2 py-2"
                    >
                      <option value="ALL">All categories</option>
                      {CONTROL_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-xs">
                    <span className="block mb-1 text-gray-900 dark:text-gray-500 dark:text-white/60">Status</span>
                    <select
                      value={controlStatusFilter}
                      onChange={(event) => setControlStatusFilter(event.target.value as 'ALL' | ControlStatus)}
                      className="w-full bg-[#0b1020] border border-white/20 rounded-md px-2 py-2"
                    >
                      <option value="ALL">All statuses</option>
                      {CONTROL_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-xs">
                    <span className="block mb-1 text-gray-900 dark:text-gray-500 dark:text-white/60">Risk</span>
                    <select
                      value={controlRiskFilter}
                      onChange={(event) => setControlRiskFilter(event.target.value as 'ALL' | ControlRisk)}
                      className="w-full bg-[#0b1020] border border-white/20 rounded-md px-2 py-2"
                    >
                      <option value="ALL">All risk levels</option>
                      {CONTROL_RISKS.map((risk) => (
                        <option key={risk} value={risk}>
                          {risk}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    onClick={toggleSelectVisibleControls}
                    className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold hover:bg-white/20"
                  >
                    {allVisibleSelected ? 'Unselect Visible' : 'Select Visible'}
                  </button>
                  <button
                    onClick={() => runBulkControlAction('Bulk activation')}
                    className="rounded-lg border border-emerald-500/30 bg-emerald-500/15 px-3 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-500/25"
                  >
                    Activate Selected
                  </button>
                  <button
                    onClick={() => runBulkControlAction('Audit sweep')}
                    className="rounded-lg border border-cyan-500/30 bg-cyan-500/15 px-3 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-500/25"
                  >
                    Run Audit
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121827] overflow-x-auto">
                <table className="w-full text-left min-w-[1300px]">
                  <thead className="text-xs uppercase tracking-widest text-gray-900 dark:text-white/40 border-b border-gray-200 dark:border-white/10">
                    <tr>
                      <th className="p-4 w-10">Sel</th>
                      <th className="p-4">Control</th>
                      <th className="p-4">Domain</th>
                      <th className="p-4">Owner</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Risk</th>
                      <th className="p-4">Coverage</th>
                      <th className="p-4">Automation</th>
                      <th className="p-4">SLA</th>
                      <th className="p-4">Run Cost</th>
                      <th className="p-4">Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredControls.slice(0, 220).map((control) => (
                      <tr key={control.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-100 dark:bg-white/5">
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={selectedControlIds.includes(control.id)}
                            onChange={() => toggleControlSelection(control.id)}
                            className="accent-cyan-400"
                          />
                        </td>
                        <td className="p-4">
                          <p className="font-bold">{control.name}</p>
                          <p className="text-xs text-gray-900 dark:text-gray-500 dark:text-white/50 font-mono">{control.id}</p>
                        </td>
                        <td className="p-4 text-sm">{control.category}</td>
                        <td className="p-4 text-sm">{control.owner}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-md text-xs font-bold border ${controlStatusClass(control.status)}`}>
                            {control.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-md text-xs font-bold border ${controlRiskClass(control.risk)}`}>
                            {control.risk}
                          </span>
                        </td>
                        <td className="p-4 text-sm">{control.coverage}%</td>
                        <td className="p-4 text-sm">{control.automation}%</td>
                        <td className="p-4 text-sm">{control.slaTarget}</td>
                        <td className="p-4 text-sm text-amber-300">{formatCurrency(control.monthlyRunCost)}</td>
                        <td className="p-4 text-xs text-gray-900 dark:text-gray-500 dark:text-white/60">{toDateLabel(control.lastUpdatedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="p-4 text-xs text-gray-900 dark:text-gray-500 dark:text-white/50 border-t border-gray-200 dark:border-white/10">
                  Showing {Math.min(filteredControls.length, 220)} of {filteredControls.length} matched controls.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'automation' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121827] p-5">
                  <p className="text-xs text-gray-900 dark:text-gray-500 dark:text-white/50 uppercase tracking-wider mb-2">Healthy Workflows</p>
                  <p className="text-3xl font-black text-emerald-300">{automationSummary.healthy}</p>
                </div>
                <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121827] p-5">
                  <p className="text-xs text-gray-900 dark:text-gray-500 dark:text-white/50 uppercase tracking-wider mb-2">Degraded</p>
                  <p className="text-3xl font-black text-rose-300">{automationSummary.degraded}</p>
                </div>
                <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121827] p-5">
                  <p className="text-xs text-gray-900 dark:text-gray-500 dark:text-white/50 uppercase tracking-wider mb-2">Maintenance</p>
                  <p className="text-3xl font-black text-amber-300">{automationSummary.maintenance}</p>
                </div>
                <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121827] p-5">
                  <p className="text-xs text-gray-900 dark:text-gray-500 dark:text-white/50 uppercase tracking-wider mb-2">Avg Success</p>
                  <p className="text-3xl font-black text-cyan-300">{automationSummary.avgSuccessRate}%</p>
                </div>
              </div>
              <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121827] overflow-x-auto">
                <table className="w-full text-left min-w-[900px]">
                  <thead className="text-xs uppercase tracking-widest text-gray-900 dark:text-white/40 border-b border-gray-200 dark:border-white/10">
                    <tr>
                      <th className="p-4">Workflow</th>
                      <th className="p-4">Owner</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Success Rate</th>
                      <th className="p-4">Avg Duration</th>
                      <th className="p-4">Last Run</th>
                    </tr>
                  </thead>
                  <tbody>
                    {automationFlows.map((flow) => (
                      <tr key={flow.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-100 dark:bg-white/5">
                        <td className="p-4">
                          <p className="font-bold">{flow.workflow}</p>
                          <p className="text-xs text-gray-900 dark:text-gray-500 dark:text-white/50 font-mono">{flow.id}</p>
                        </td>
                        <td className="p-4">{flow.owner}</td>
                        <td className="p-4">{flow.status}</td>
                        <td className="p-4 text-cyan-300 font-bold">{flow.successRate}%</td>
                        <td className="p-4">{flow.avgDurationSec}s</td>
                        <td className="p-4 text-xs text-gray-900 dark:text-gray-500 dark:text-white/60">{toDateTimeLabel(flow.lastRunAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
              <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121827] p-5">
                <h3 className="font-black mb-4">Security Scorecards</h3>
                <div className="space-y-4">
                  {[
                    { name: 'Privileged Access', score: 97 },
                    { name: 'Abuse and Fraud Defense', score: 94 },
                    { name: 'Privacy and Data Boundaries', score: 95 },
                    { name: 'Incident Readiness', score: 92 }
                  ].map((pillar) => (
                    <div key={pillar.name} className="rounded-xl border border-gray-200 dark:border-white/10 bg-[#0f1421] p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-bold text-sm">{pillar.name}</p>
                        <span className="text-cyan-300 font-bold">{pillar.score}%</span>
                      </div>
                      <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${pillar.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121827] p-5">
                <h3 className="font-black mb-4">Live Risk Signals</h3>
                <div className="space-y-3">
                  {riskIncidents.map((incident) => (
                    <div key={incident.id} className="rounded-xl border border-gray-200 dark:border-white/10 bg-[#0f1421] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-bold text-sm">{incident.title}</p>
                        <span className="text-xs font-bold text-rose-300">{incident.severity}</span>
                      </div>
                      <p className="text-xs text-gray-900 dark:text-gray-500 dark:text-white/60 mt-1">{incident.stream} | Owner: {incident.owner}</p>
                      <p className="text-xs text-gray-900 dark:text-gray-500 dark:text-white/50 mt-1">{incident.impactedStores} stores impacted</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'finance' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
                <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121827] p-5">
                  <p className="text-xs text-gray-900 dark:text-gray-500 dark:text-white/50 uppercase tracking-wider mb-2">Gross GMV</p>
                  <p className="text-2xl font-black text-emerald-300">{formatCurrency(safeStats.totalRevenue)}</p>
                </div>
                <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121827] p-5">
                  <p className="text-xs text-gray-900 dark:text-gray-500 dark:text-white/50 uppercase tracking-wider mb-2">Net Revenue</p>
                  <p className="text-2xl font-black text-cyan-300">{formatCurrency(netRevenue)}</p>
                </div>
                <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121827] p-5">
                  <p className="text-xs text-gray-900 dark:text-gray-500 dark:text-white/50 uppercase tracking-wider mb-2">Take Rate</p>
                  <p className="text-2xl font-black text-blue-300">{platformTakeRate}%</p>
                </div>
                <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121827] p-5">
                  <p className="text-xs text-gray-900 dark:text-gray-500 dark:text-white/50 uppercase tracking-wider mb-2">Control Opex</p>
                  <p className="text-2xl font-black text-amber-300">{formatCurrency(controlSummary.monthlyRunCost)}</p>
                </div>
                <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121827] p-5">
                  <p className="text-xs text-gray-900 dark:text-gray-500 dark:text-white/50 uppercase tracking-wider mb-2">Compliance</p>
                  <p className="text-2xl font-black text-purple-300">{complianceCoverage}%</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'growth' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {growthPrograms.map((program) => (
                  <div key={program.id} className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121827] p-5">
                    <p className="text-xs text-gray-900 dark:text-gray-500 dark:text-white/50 uppercase tracking-wider mb-2">{program.status}</p>
                    <h3 className="font-black mb-2">{program.name}</h3>
                    <p className="text-sm">
                      Reach: <span className="text-cyan-300 font-bold">{program.reach.toLocaleString()}</span>
                    </p>
                    <p className="text-sm text-emerald-300 mt-1">{program.impact}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'compliance' && (
            <div className="space-y-4 animate-fade-in">
              <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121827] overflow-x-auto">
                <table className="w-full text-left min-w-[900px]">
                  <thead className="text-xs uppercase tracking-widest text-gray-900 dark:text-white/40 border-b border-gray-200 dark:border-white/10">
                    <tr>
                      <th className="p-4">Framework</th>
                      <th className="p-4">Owner</th>
                      <th className="p-4">Coverage</th>
                      <th className="p-4">Open Findings</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complianceBoards.map((board) => (
                      <tr key={board.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-100 dark:bg-white/5">
                        <td className="p-4 font-bold">{board.framework}</td>
                        <td className="p-4">{board.owner}</td>
                        <td className="p-4 text-cyan-300 font-bold">{board.coverage}%</td>
                        <td className="p-4 text-amber-300 font-bold">{board.openFindings}</td>
                        <td className="p-4">{board.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'support' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121827] p-5">
                  <p className="text-xs text-gray-900 dark:text-gray-500 dark:text-white/50 uppercase tracking-wider mb-2">Queue Depth</p>
                  <p className="text-3xl font-black text-cyan-300">{supportSummary.queueDepth}</p>
                </div>
                <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121827] p-5">
                  <p className="text-xs text-gray-900 dark:text-gray-500 dark:text-white/50 uppercase tracking-wider mb-2">Avg First Response</p>
                  <p className="text-3xl font-black text-emerald-300">{supportSummary.avgFirstResponse} min</p>
                </div>
                <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121827] p-5">
                  <p className="text-xs text-gray-900 dark:text-gray-500 dark:text-white/50 uppercase tracking-wider mb-2">SLA At Risk</p>
                  <p className="text-3xl font-black text-rose-300">{supportSummary.slaAtRisk}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'risk' && (
            <div className="space-y-4 animate-fade-in">
              <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121827] overflow-x-auto">
                <table className="w-full text-left min-w-[900px]">
                  <thead className="text-xs uppercase tracking-widest text-gray-900 dark:text-white/40 border-b border-gray-200 dark:border-white/10">
                    <tr>
                      <th className="p-4">Incident</th>
                      <th className="p-4">Severity</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Impacted Stores</th>
                      <th className="p-4">Owner</th>
                      <th className="p-4">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {riskIncidents.map((incident) => (
                      <tr key={incident.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-100 dark:bg-white/5">
                        <td className="p-4">
                          <p className="font-bold">{incident.title}</p>
                          <p className="text-xs text-gray-900 dark:text-gray-500 dark:text-white/50 font-mono">{incident.id}</p>
                        </td>
                        <td className="p-4">{incident.severity}</td>
                        <td className="p-4">{incident.status}</td>
                        <td className="p-4">{incident.impactedStores}</td>
                        <td className="p-4">{incident.owner}</td>
                        <td className="p-4 text-xs text-gray-900 dark:text-gray-500 dark:text-white/60">{toDateTimeLabel(incident.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'sellers' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-black">Merchant Network</h2>
              <div className="bg-white dark:bg-[#0f111a]/50 border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-100 dark:bg-white/5 border-b border-gray-200 dark:border-white/10 text-gray-900 dark:text-gray-500 dark:text-white/50 uppercase tracking-wider font-bold text-xs">
                    <tr>
                      <th className="px-6 py-4">Seller</th>
                      <th className="px-6 py-4">Owned Stores</th>
                      <th className="px-6 py-4">Gross Revenue</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filteredSellers.map(seller => (
                      <tr key={seller.id} className="hover:bg-gray-100 dark:bg-white/5">
                        <td className="px-6 py-4">
                          <p className="font-bold">{seller.name}</p>
                          <p className="text-gray-900 dark:text-gray-500 dark:text-white/50 text-xs">{seller.email}</p>
                        </td>
                        <td className="px-6 py-4 font-bold text-cyan-400">{seller.stores}</td>
                        <td className="px-6 py-4 font-bold">{formatCurrency(seller.totalRevenue)}</td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button onClick={() => toggleRoleMutation.mutate(seller.id)} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold">Revoke Admin</button>
                          <button onClick={() => handleDeleteUser(seller.id)} className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'shoppers' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-black">Global Consumers</h2>
              <div className="bg-white dark:bg-[#0f111a]/50 border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-100 dark:bg-white/5 border-b border-gray-200 dark:border-white/10 text-gray-900 dark:text-gray-500 dark:text-white/50 uppercase tracking-wider font-bold text-xs">
                    <tr>
                      <th className="px-6 py-4">Consumer</th>
                      <th className="px-6 py-4">Lifetime Orders</th>
                      <th className="px-6 py-4">Total Value</th>
                      <th className="px-6 py-4">Is Seller?</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filteredShoppers.map(shopper => (
                      <tr key={shopper.id} className="hover:bg-gray-100 dark:bg-white/5">
                        <td className="px-6 py-4">
                          <p className="font-bold">{shopper.name}</p>
                          <p className="text-gray-900 dark:text-gray-500 dark:text-white/50 text-xs">{shopper.email}</p>
                        </td>
                        <td className="px-6 py-4 font-bold">{shopper.orders}</td>
                        <td className="px-6 py-4 font-bold text-emerald-400">{formatCurrency(shopper.spend)}</td>
                        <td className="px-6 py-4">
                          {shopper.isSeller ? <span className="bg-cyan-500/20 text-cyan-300 text-xs px-2 py-1 rounded font-bold">Yes</span> : <span className="text-gray-900 dark:text-white/30 text-xs font-bold">No</span>}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button onClick={() => toggleRoleMutation.mutate(shopper.id)} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold">Make Admin</button>
                          <button onClick={() => handleDeleteUser(shopper.id)} className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'stores' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-black flex items-center justify-between">
                Network Stores
              </h2>
              <div className="bg-white dark:bg-[#0f111a]/50 border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-100 dark:bg-white/5 border-b border-gray-200 dark:border-white/10 text-gray-900 dark:text-gray-500 dark:text-white/50 uppercase tracking-wider font-bold text-xs">
                    <tr>
                      <th className="px-6 py-4">Store Profile</th>
                      <th className="px-6 py-4">Owner</th>
                      <th className="px-6 py-4">Tier</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filteredStores.map(store => {
                      const owner = usersById.get(store.ownerId);
                      const tier = resolveStorePlan(store);
                      return (
                        <tr key={store.id} className="hover:bg-gray-100 dark:bg-white/5">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs bg-${store.themeColor}-500/20 text-${store.themeColor}-400`}>
                                {store.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold">{store.name}</p>
                                <p className="text-gray-900 dark:text-gray-500 dark:text-white/50 text-xs">{store.products?.length || 0} Products</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {owner ? (
                              <div>
                                <p className="font-bold">{owner.name}</p>
                                <p className="text-gray-900 dark:text-gray-500 dark:text-white/50 text-xs">{owner.email}</p>
                              </div>
                            ) : <span className="text-gray-900 dark:text-white/30 italic text-xs">Unknown</span>}
                          </td>
                          <td className="px-6 py-4">
                            <select
                              className={`bg-transparent border-none text-xs font-bold outline-none cursor-pointer ${planBadgeClass(tier)} px-2 py-1 rounded`}
                              value={tier}
                              onChange={(e) => updateStorePlanMutation.mutate({ id: store.id, tier: e.target.value as PlanTier })}
                            >
                              {PLAN_TIERS.map(t => <option key={t} value={t} className="bg-gray-900 text-gray-900 dark:text-white">{t}</option>)}
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => toggleMaintenanceMutation.mutate(store.id)}
                              className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md transition-colors ${store.settings?.maintenanceMode ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}
                            >
                              <span className={`w-2 h-2 rounded-full ${store.settings?.maintenanceMode ? 'bg-orange-400' : 'bg-emerald-400'}`}></span>
                              {store.settings?.maintenanceMode ? 'Suspended / Maint.' : 'Live'}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <button onClick={() => onNavigate(`/store/${store.id}`)} className="p-2 rounded-lg bg-white/10 hover:bg-white/20"><Eye size={16} /></button>
                            <button onClick={() => handleDeleteStore(store.id)} className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"><Trash2 size={16} /></button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-black">Global Orders Ledger</h2>
              <div className="bg-white dark:bg-[#0f111a]/50 border border-gray-200 dark:border-white/10 rounded-2xl overflow-x-auto">
                <table className="w-full text-left min-w-[900px]">
                  <thead className="bg-gray-100 dark:bg-white/5 border-b border-gray-200 dark:border-white/10 text-gray-900 dark:text-gray-500 dark:text-white/50 uppercase tracking-wider font-bold text-xs">
                    <tr>
                      <th className="px-6 py-4">Order</th>
                      <th className="px-6 py-4">Store</th>
                      <th className="px-6 py-4">Shopper</th>
                      <th className="px-6 py-4">Value</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-100 dark:bg-white/5">
                        <td className="px-6 py-4 text-xs font-mono text-cyan-300">{order.id}</td>
                        <td className="px-6 py-4">{order.store?.name || 'Unknown'}</td>
                        <td className="px-6 py-4">
                          <p>{order.customerName}</p>
                          <p className="text-xs text-gray-900 dark:text-gray-500 dark:text-white/50">{order.customerEmail}</p>
                        </td>
                        <td className="px-6 py-4 font-bold text-emerald-300">{formatCurrency(order.total)}</td>
                        <td className="px-6 py-4 text-xs font-bold">{order.status}</td>
                        <td className="px-6 py-4 text-xs text-gray-900 dark:text-gray-500 dark:text-white/60">{toDateTimeLabel(order.date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-black">Global Product Moderation</h2>
              <div className="bg-white dark:bg-[#0f111a]/50 border border-gray-200 dark:border-white/10 rounded-2xl overflow-x-auto">
                <table className="w-full text-left min-w-[900px]">
                  <thead className="bg-gray-100 dark:bg-white/5 border-b border-gray-200 dark:border-white/10 text-gray-900 dark:text-gray-500 dark:text-white/50 uppercase tracking-wider font-bold text-xs">
                    <tr>
                      <th className="px-6 py-4">Product</th>
                      <th className="px-6 py-4">Store</th>
                      <th className="px-6 py-4">Price</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-100 dark:bg-white/5">
                        <td className="px-6 py-4">
                          <p className="font-bold">{product.name}</p>
                          <p className="text-xs text-gray-900 dark:text-gray-500 dark:text-white/50 font-mono">{product.id}</p>
                        </td>
                        <td className="px-6 py-4">{product.store?.name || 'Unknown'}</td>
                        <td className="px-6 py-4 font-bold text-emerald-300">{formatCurrency(product.price)}</td>
                        <td className="px-6 py-4">{product.status}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-black">Infrastructure</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-[#0f111a]/50 border border-gray-200 dark:border-white/10 rounded-2xl p-6">
                  <h3 className="font-bold mb-4 flex items-center gap-2"><Server className="text-purple-400" /> Core Services</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between p-3 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                      <span>API Gateway</span><span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle size={14} /> Healthy</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                      <span>Database Cluster</span><span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle size={14} /> 12ms ping</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                      <span>Background Workers</span><span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle size={14} /> 4 nodes</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-[#0f111a]/50 border border-gray-200 dark:border-white/10 rounded-2xl p-6">
                  <h3 className="font-bold mb-4 flex items-center gap-2"><Shield className="text-cyan-400" /> Security Analytics</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between p-3 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                      <span>Blocked IPs (24h)</span><span className="font-bold">142</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                      <span>Failed Logins</span><span className="font-bold text-orange-400">89</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-[#0f111a]/50 border border-emerald-500/20 rounded-2xl p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2 text-emerald-400"><Activity /> Network Integrity</h3>
                <div className="grid grid-cols-3 gap-6 text-sm">
                  <p className="flex justify-between">
                    <span className="text-gray-900 dark:text-gray-500 dark:text-white/60">Users with admin role</span>
                    <span className="font-bold">{allUsers.filter((entry) => entry.role === 'admin').length}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-900 dark:text-gray-500 dark:text-white/60">Seller accounts</span>
                    <span className="font-bold">{audience?.summary.sellerCount || 0}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-900 dark:text-gray-500 dark:text-white/60">Products moderated</span>
                    <span className="font-bold">{allProducts.length}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black flex items-center gap-2">
                    <Sparkles className="text-amber-400" /> Premium Features
                  </h2>
                  <p className="text-white/60 mt-1">Manage premium feature access across all plan tiers</p>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20">
                  <p className="text-xs text-white/50 uppercase tracking-wider">Total Features</p>
                  <p className="text-2xl font-black text-cyan-300">{featureSummary.total}</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-gray-500/10 to-gray-500/5 border border-gray-500/20">
                  <p className="text-xs text-white/50 uppercase tracking-wider">STARTER</p>
                  <p className="text-2xl font-black text-gray-300">{featureSummary.starter}</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
                  <p className="text-xs text-white/50 uppercase tracking-wider">PRO</p>
                  <p className="text-2xl font-black text-blue-300">{featureSummary.pro}</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20">
                  <p className="text-xs text-white/50 uppercase tracking-wider">PREMIUM</p>
                  <p className="text-2xl font-black text-amber-300">{featureSummary.premium}</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
                  <p className="text-xs text-white/50 uppercase tracking-wider">ENTERPRISE</p>
                  <p className="text-2xl font-black text-purple-300">{featureSummary.enterprise}</p>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-4 p-4 rounded-xl bg-[#0f111a]/50 border border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/50 uppercase font-bold">Category:</span>
                  <select
                    value={featureCategoryFilter}
                    onChange={(e) => setFeatureCategoryFilter(e.target.value as 'ALL' | FeatureCategory)}
                    className="bg-[#131827] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-400/50"
                  >
                    <option value="ALL">All Categories</option>
                    {FEATURE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/50 uppercase font-bold">Plan Tier:</span>
                  <select
                    value={featureTierFilter}
                    onChange={(e) => setFeatureTierFilter(e.target.value as 'ALL' | PlanTier)}
                    className="bg-[#131827] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-400/50"
                  >
                    <option value="ALL">All Tiers</option>
                    {PLAN_TIERS.map((tier) => (
                      <option key={tier} value={tier}>{tier}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1"></div>
                <div className="text-sm text-white/50">
                  Showing {filteredFeatures.length} of {PREMIUM_FEATURES.length} features
                </div>
              </div>

              {/* Features Grid by Category */}
              <div className="space-y-8">
                {FEATURE_CATEGORIES.map((category) => {
                  const categoryFeatures = filteredFeatures.filter(f => f.category === category);
                  if (categoryFeatures.length === 0) return null;

                  const categoryIcons: Record<FeatureCategory, React.ElementType> = {
                    'Marketing & Sales': Megaphone,
                    'Store Management': ShoppingBag,
                    'Advanced Commerce': Zap,
                    'Support & Branding': Building2,
                    'AI Advanced': Brain,
                    'Core Platform': Server
                  };
                  const CategoryIcon = categoryIcons[category];

                  return (
                    <div key={category} className="space-y-4">
                      <h3 className="text-lg font-bold flex items-center gap-2">
                        <CategoryIcon className="text-cyan-400" size={20} />
                        {category}
                        <span className="text-xs text-white/50 font-normal">({categoryFeatures.length} features)</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categoryFeatures.map((feature) => {
                          const iconMap: Record<string, React.ElementType> = {
                            PackagePlus: PackagePlus,
                            Mail: Mail,
                            Target: Target,
                            BarChart3: BarChart3,
                            Tag: Tag,
                            Gift: Gift,
                            Zap: Zap,
                            Bell: Bell,
                            Languages: Languages,
                            Building2: Building2,
                            Boxes: Boxes,
                            Package: Package,
                            Palette: Palette,
                            Crown: Crown,
                            Calendar: Calendar,
                            Clock: Clock,
                            Server: Server,
                            FileText: FileText,
                            UsersRound: UsersRound,
                            Bot: Bot,
                            Brain: Brain,
                            Video: Video,
                            TestTube: TestTube,
                            LineChart: LineChart,
                            Search: Search,
                            Users: Users,
                            Activity: Activity,
                            UserCog: UserCog,
                            Megaphone: Megaphone,
                            DollarSign: DollarSign,
                            Eye: Eye,
                            CreditCard: CreditCard,
                            Globe: Globe,
                            Receipt: Receipt,
                            Shield: Shield,
                            Store: StoreIcon
                          };
                          const FeatureIcon = iconMap[feature.icon] || Sparkles;

                          return (
                            <div
                              key={feature.id}
                              className="p-4 rounded-xl bg-[#0f111a]/50 border border-white/10 hover:border-cyan-400/30 transition-all group"
                              title={feature.tooltip}
                            >
                              <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-300">
                                  <FeatureIcon size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-sm truncate">{feature.name}</h4>
                                  <p className="text-xs text-white/50 mt-1 line-clamp-2">{feature.description}</p>
                                  <div className="flex flex-wrap gap-1 mt-3">
                                    {feature.tiers.map((tier) => (
                                      <span
                                        key={tier}
                                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${planBadgeClass(tier)}`}
                                      >
                                        {tier}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredFeatures.length === 0 && (
                <div className="text-center py-12">
                  <Sparkles className="mx-auto mb-4 text-white/30" size={48} />
                  <p className="text-white/50">No features match your filters</p>
                </div>
              )}
            </div>
          )}

          {/* Auto Pilot Tab */}
          {activeTab === 'autopilot' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Rocket className="text-cyan-400" size={32} /> AI Auto Pilot
                  </h1>
                  <p className="text-white/50 mt-1">Full AI automation for platform-wide operations</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-white/50">Platform Auto Pilot</span>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-cyan-600">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition" />
                  </button>
                </div>
              </div>

              {/* AI Platform Dashboard */}
              <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <Brain size={28} />
                  <h2 className="text-xl font-bold">Platform AI Control Center</h2>
                </div>
                <p className="text-cyan-100 mb-4">AI is actively managing the entire platform ecosystem, from vendor approval to fraud detection.</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/20 rounded-xl p-3">
                    <div className="text-2xl font-bold">25</div>
                    <div className="text-xs text-cyan-100">Active Automations</div>
                  </div>
                  <div className="bg-white/20 rounded-xl p-3">
                    <div className="text-2xl font-bold">156</div>
                    <div className="text-xs text-cyan-100">Insights Today</div>
                  </div>
                  <div className="bg-white/20 rounded-xl p-3">
                    <div className="text-2xl font-bold">$2.4M</div>
                    <div className="text-xs text-cyan-100">Revenue Optimized</div>
                  </div>
                  <div className="bg-white/20 rounded-xl p-3">
                    <div className="text-2xl font-bold">99.9%</div>
                    <div className="text-xs text-cyan-100">Uptime</div>
                  </div>
                </div>
              </div>

              {/* Platform Auto Pilot Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Vendor Management */}
                <div className="bg-[#0f111a]/50 border border-white/10 rounded-xl p-5 hover:border-cyan-400/30 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-300">
                      <UserCog size={20} />
                    </div>
                    <h3 className="font-bold text-white">Auto Vendor Approval</h3>
                  </div>
                  <p className="text-xs text-white/50 mb-3">AI automatically reviews and approves vendor applications</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-green-400">Active</span>
                    <div className="w-8 h-4 bg-green-500 rounded-full relative"><div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div></div>
                  </div>
                </div>

                {/* Fraud Detection */}
                <div className="bg-[#0f111a]/50 border border-white/10 rounded-xl p-5 hover:border-cyan-400/30 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-red-500/10 text-red-300">
                      <Shield size={20} />
                    </div>
                    <h3 className="font-bold text-white">Fraud Detection</h3>
                  </div>
                  <p className="text-xs text-white/50 mb-3">Real-time AI monitoring for fraudulent transactions</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-green-400">Active</span>
                    <div className="w-8 h-4 bg-green-500 rounded-full relative"><div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div></div>
                  </div>
                </div>

                {/* Dispute Resolution */}
                <div className="bg-[#0f111a]/50 border border-white/10 rounded-xl p-5 hover:border-cyan-400/30 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-300">
                      <MessageSquare size={20} />
                    </div>
                    <h3 className="font-bold text-white">Dispute Resolution</h3>
                  </div>
                  <p className="text-xs text-white/50 mb-3">AI automatically resolves customer disputes</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-green-400">Active</span>
                    <div className="w-8 h-4 bg-green-500 rounded-full relative"><div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div></div>
                  </div>
                </div>

                {/* Revenue Optimization */}
                <div className="bg-[#0f111a]/50 border border-white/10 rounded-xl p-5 hover:border-cyan-400/30 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-green-500/10 text-green-300">
                      <DollarSign size={20} />
                    </div>
                    <h3 className="font-bold text-white">Revenue Optimization</h3>
                  </div>
                  <p className="text-xs text-white/50 mb-3">AI optimizes pricing and commission structures</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-green-400">Active</span>
                    <div className="w-8 h-4 bg-green-500 rounded-full relative"><div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div></div>
                  </div>
                </div>

                {/* Compliance */}
                <div className="bg-[#0f111a]/50 border border-white/10 rounded-xl p-5 hover:border-cyan-400/30 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-300">
                      <CheckCircle size={20} />
                    </div>
                    <h3 className="font-bold text-white">Auto Compliance</h3>
                  </div>
                  <p className="text-xs text-white/50 mb-3">Automated compliance checking and reporting</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-green-400">Active</span>
                    <div className="w-8 h-4 bg-green-500 rounded-full relative"><div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div></div>
                  </div>
                </div>

                {/* Security Monitoring */}
                <div className="bg-[#0f111a]/50 border border-white/10 rounded-xl p-5 hover:border-cyan-400/30 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-300">
                      <Server size={20} />
                    </div>
                    <h3 className="font-bold text-white">Security Monitoring</h3>
                  </div>
                  <p className="text-xs text-white/50 mb-3">24/7 AI security threat detection</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-green-400">Active</span>
                    <div className="w-8 h-4 bg-green-500 rounded-full relative"><div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div></div>
                  </div>
                </div>

                {/* Market Insights */}
                <div className="bg-[#0f111a]/50 border border-white/10 rounded-xl p-5 hover:border-cyan-400/30 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-orange-500/10 text-orange-300">
                      <LineChart size={20} />
                    </div>
                    <h3 className="font-bold text-white">Market Insights</h3>
                  </div>
                  <p className="text-xs text-white/50 mb-3">AI-powered market trend analysis</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-green-400">Active</span>
                    <div className="w-8 h-4 bg-green-500 rounded-full relative"><div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div></div>
                  </div>
                </div>

                {/* Churn Prediction */}
                <div className="bg-[#0f111a]/50 border border-white/10 rounded-xl p-5 hover:border-cyan-400/30 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-pink-500/10 text-pink-300">
                      <Users size={20} />
                    </div>
                    <h3 className="font-bold text-white">Churn Prediction</h3>
                  </div>
                  <p className="text-xs text-white/50 mb-3">Predict and prevent user churn</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-yellow-400">Beta</span>
                    <div className="w-8 h-4 bg-yellow-500 rounded-full relative"><div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div></div>
                  </div>
                </div>

                {/* Content Moderation */}
                <div className="bg-[#0f111a]/50 border border-white/10 rounded-xl p-5 hover:border-cyan-400/30 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-300">
                      <Eye size={20} />
                    </div>
                    <h3 className="font-bold text-white">Content Moderation</h3>
                  </div>
                  <p className="text-xs text-white/50 mb-3">AI-powered content filtering</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-green-400">Active</span>
                    <div className="w-8 h-4 bg-green-500 rounded-full relative"><div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div></div>
                  </div>
                </div>
              </div>

              {/* Platform Analytics */}
              <div className="bg-[#0f111a]/50 border border-white/10 rounded-2xl p-6">
                <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2">
                  <Activity className="text-cyan-400" size={20} /> Platform AI Analytics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-2xl font-bold text-white">1,234</div>
                    <div className="text-xs text-white/50">Vendors Monitored</div>
                    <div className="mt-2 text-xs text-green-400">+12 this week</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-2xl font-bold text-white">$4.2M</div>
                    <div className="text-xs text-white/50">Revenue Managed</div>
                    <div className="mt-2 text-xs text-green-400">+8% this month</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-2xl font-bold text-white">99.7%</div>
                    <div className="text-xs text-white/50">Platform Uptime</div>
                    <div className="mt-2 text-xs text-green-400">AI Optimized</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
