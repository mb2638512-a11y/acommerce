export type UserRole = 'user' | 'admin';
export type PlanTier = 'STARTER' | 'PRO' | 'PREMIUM' | 'ENTERPRISE';
export type KYCStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  isVerified?: boolean;
  kycStatus?: KYCStatus;
  idDocumentUrl?: string;
  paymentVerified?: boolean;
  stripeCustomerId?: string;
  paypalPayerId?: string;
  joinedAt?: number;
  createdAt?: string | number;
  // For role-based redirect
  stores?: string[]; // Array of store IDs the user owns
  plan?: PlanTier;
}

export interface Review {
  id: string;
  productId: string;
  rating: number; // 1-5
  comment: string;
  customerName: string;
  date: number;
}

export interface ProductVariant {
  name: string; // e.g., "Size", "Color"
  options: string[]; // e.g., ["S", "M", "L"], ["Red", "Blue"]
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  vendor?: string;
  productType?: string;
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';

  // Pricing
  price: number;
  compareAtPrice?: number;
  costPerItem?: number;
  taxable?: boolean;

  // Media
  images: string[]; // Array of URLs
  imageUrl: string; // Featured image (kept for backward compatibility)

  // Inventory
  stock: number;
  sku?: string;
  barcode?: string;
  trackQuantity?: boolean;
  continueSellingOutOfStock?: boolean;

  // Shipping
  isDigital?: boolean;
  digitalFileUrl?: string;
  weight?: number;
  weightUnit?: 'kg' | 'lb' | 'oz' | 'g';

  // SEO
  slug?: string;
  seoTitle?: string;
  seoDescription?: string;

  isFeatured: boolean;
  variants?: ProductVariant[];
  reviews?: Review[];
  relatedProducts?: string[]; // AI Suggested related products
  createdAt: number;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  imageUrl?: string;
  author: string;
  status: 'DRAFT' | 'PUBLISHED';
  category?: string;
  date: number; // Published date
  updatedAt: number;
  tags: string[];
  views: number;
  readingTime: number; // in minutes
  seoTitle?: string;
  seoDescription?: string;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  isVisible: boolean;
  updatedAt: number;
}

export interface ActivityLogEntry {
  id: string;
  action: string;
  details: string;
  timestamp: number;
}

export interface DiscountCode {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  usageCount: number;
  active: boolean;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  date: number;
  read: boolean;
}

export interface Subscriber {
  id: string;
  email: string;
  date: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'admin';
  content: string;
  timestamp: number;
  productId?: string; // Context: Which product they are talking about
}

export interface ChatSession {
  id: string;
  customerId: string; // email or unique session ID
  customerName: string;
  lastMessage: string;
  lastUpdate: number;
  unreadAdmin: number;
  unreadUser: number;
  messages: ChatMessage[];
}

export interface AboutPageConfig {
  title?: string;
  heroImage?: string;
  story?: string;
  mission?: string;
}

export interface ContactPageConfig {
  title?: string;
  email?: string;
  phone?: string;
  address?: string;
  message?: string;
}

export interface StoreSettings {
  shippingFee: number;
  taxRate: number;
  bannerUrl?: string;
  logoUrl?: string;
  font?: 'sans' | 'serif' | 'mono';
  borderRadius?: 'none' | 'sm' | 'md' | 'full';
  currency: string;
  maintenanceMode: boolean;
  announcementBar?: string;
  freeShippingThreshold?: number;
  salesGoal?: number;
  socialLinks?: { facebook?: string; instagram?: string; twitter?: string; whatsapp?: string };
  aboutPage?: AboutPageConfig;
  contactPage?: ContactPageConfig;
  loyaltyProgram?: {
    enabled: boolean;
    pointsPerDollar: number;
    minimumRedemption: number;
  };
  subscription?: {
    tier: PlanTier;
    status?: 'active' | 'trialing' | 'past_due' | 'cancelled';
    renewsAt?: string;
    updatedAt?: string;
  };
}

export interface Staff {
  userId: string;
  email: string;
  name: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  joinedAt: number;
}

export interface Store {
  id: string;
  ownerId: string;
  staff?: Staff[]; // Added staff list
  name: string;
  slug: string;
  themeColor: string;
  description: string;
  products: Product[];
  orders: Order[];
  customers: Customer[];
  discounts: DiscountCode[];
  blogPosts: BlogPost[];
  pages: Page[];
  activityLog: ActivityLogEntry[];
  messages: Message[];
  subscribers: Subscriber[];
  chatSessions: ChatSession[]; // New: Real-time chat sessions
  settings: StoreSettings;
  createdAt: number;
  planTier?: PlanTier;

  // Analytics
  totalVisits?: number;
}

export interface CartItem extends Product {
  quantity: number;
  selectedVariant?: string;
}

export interface Customer {
  id: string;
  email: string;
  name: string;
  totalSpent: number;
  ordersCount: number;
  lastOrderDate: number;
  wishlist: string[]; // Array of product IDs
  loyaltyPoints: number;
  notes?: string;
  tags?: string[];
  city?: string;
  country?: string;
}

export interface OrderTimelineEntry {
  date: number;
  status: string;
  note?: string;
}

export interface Order {
  id: string;
  storeId: string;
  customer: {
    name: string;
    email: string;
    address: string;
    city?: string;
  };
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  discountCode?: string;
  total: number;

  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  paymentStatus: 'PAID' | 'PENDING' | 'REFUNDED' | 'FAILED';
  fulfillmentStatus: 'UNFULFILLED' | 'PARTIAL' | 'FULFILLED';

  timeline: OrderTimelineEntry[];
  notes?: string; // Internal notes
  customerNotes?: string; // Notes from customer at checkout
  date: number;
}

export enum ViewMode {
  PLATFORM = 'PLATFORM',
  STORE_ADMIN = 'STORE_ADMIN',
  STORE_FRONT = 'STORE_FRONT'
}

// ============ Checkout Types ============

export type CheckoutStep = 'cart' | 'shipping' | 'payment' | 'review';

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  saveAddress: boolean;
}

export type ShippingMethodType = 'standard' | 'express' | 'overnight';

export interface ShippingMethod {
  id: ShippingMethodType;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
}

export type PaymentMethodType =
  | 'card'
  | 'paypal'
  | 'apple_pay'
  | 'google_pay'
  | 'klarna'
  | 'afterpay'
  | 'bank_transfer'
  | 'cod'
  | 'store_credit';

export interface PaymentMethod {
  id: PaymentMethodType;
  name: string;
  description: string;
  icon: string;
  available: boolean;
}

export interface CardDetails {
  number: string;
  expiry: string;
  cvc: string;
  name: string;
}

export interface CheckoutState {
  currentStep: CheckoutStep;
  shippingAddress: ShippingAddress | null;
  shippingMethod: ShippingMethod | null;
  paymentMethod: PaymentMethodType | null;
  cardDetails: CardDetails | null;
  couponCode: string;
  discount: number;
  orderNotes: string;
  isGuestCheckout: boolean;
  termsAccepted: boolean;
}

export interface OrderConfirmation {
  orderId: string;
  orderNumber: string;
  email: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethodType;
  estimatedDelivery: string;
  date: number;
}
