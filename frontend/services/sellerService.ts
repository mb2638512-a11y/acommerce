// Seller API Service for ACommerce Platform
// Handles Stripe Connect integration and seller dashboard

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface SellerStatus {
 hasAccount: boolean;
 stripeAccountId?: string;
 chargesEnabled: boolean;
 payoutsEnabled: boolean;
 detailsSubmitted: boolean;
 commissionRate: number;
 planTier: string;
 createdAt?: string;
}

interface Commission {
 id: string;
 orderId: string;
 sellerId: string;
 amount: number;
 commission: number;
 sellerPayout: number;
 status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED';
 stripeTransferId?: string;
 stripeChargeId?: string;
 createdAt: string;
 paidAt?: string;
}

interface Payout {
 id: string;
 amount: number;
 currency: string;
 status: string;
 arrivalDate: string | null;
 created: string | null;
}

interface DashboardSummary {
 hasAccount: boolean;
 accountStatus?: {
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
 };
 summary: {
  totalEarnings: number;
  pendingPayout: number;
  paidOut: number;
  failed: number;
  transactionCount: number;
  balanceAvailable: number;
  balancePending: number;
 };
}

interface OnboardResponse {
 url: string;
 stripeAccountId: string;
 isNewAccount: boolean;
}

// Get auth token from localStorage
const getAuthToken = (): string | null => {
 return localStorage.getItem('auth_token') || localStorage.getItem('token');
};

// Make authenticated request
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

// Start seller onboarding process
export const onboardSeller = async (
 businessName: string,
 returnUrl: string,
 refreshUrl: string
): Promise<OnboardResponse> => {
 return fetchApi<OnboardResponse>('/seller/onboard', {
  method: 'POST',
  body: JSON.stringify({ businessName, returnUrl, refreshUrl }),
 });
};

// Get seller Connect account status
export const getSellerStatus = async (): Promise<SellerStatus> => {
 return fetchApi<SellerStatus>('/seller/status');
};

// Get seller's commission history
export const getCommissions = async (
 page: number = 1,
 limit: number = 20,
 status?: string
): Promise<{ commissions: Commission[]; pagination: any }> => {
 const params = new URLSearchParams({
  page: page.toString(),
  limit: limit.toString(),
 });
 if (status && status !== 'ALL') {
  params.append('status', status);
 }
 return fetchApi(`/seller/commissions?${params}`);
};

// Get seller's payout history
export const getPayouts = async (limit: number = 10): Promise<{ payouts: Payout[] }> => {
 return fetchApi(`/seller/payouts?limit=${limit}`);
};

// Get seller's dashboard summary
export const getDashboardSummary = async (): Promise<DashboardSummary> => {
 return fetchApi<DashboardSummary>('/seller/dashboard');
};

// Get Stripe dashboard login link
export const getDashboardLink = async (): Promise<{ url: string }> => {
 return fetchApi<{ url: string }>('/seller/dashboard-link');
};

// Update seller's plan tier
export const updateSellerPlan = async (planTier: string): Promise<{
 success: boolean;
 planTier: string;
 commissionRate: number;
}> => {
 return fetchApi('/seller/plan', {
  method: 'PUT',
  body: JSON.stringify({ planTier }),
 });
};

// Format currency
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
 return new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency,
 }).format(amount);
};

// Format date
export const formatDate = (dateString: string | null): string => {
 if (!dateString) return 'N/A';
 return new Date(dateString).toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
 });
};

// Get status color for UI
export const getStatusColor = (status: string): string => {
 const colors: Record<string, string> = {
  PENDING: 'yellow',
  PAID: 'green',
  FAILED: 'red',
  CANCELLED: 'gray',
  pending: 'yellow',
  paid: 'green',
  failed: 'red',
 };
 return colors[status] || 'gray';
};

// Get commission rate display
export const getCommissionRateDisplay = (rate: number): string => {
 return `${(rate * 100).toFixed(0)}%`;
};

// ==================== Follower System API ====================

interface FollowerInfo {
 followerId: string;
 name: string;
 email: string;
 avatar: string | null;
 followedAt: string;
}

interface FollowerAnalyticsData {
 totalFollowers: number;
 periodStats: {
  newFollowers: number;
  unfollowers: number;
  netGrowth: number;
  retentionRate: number;
 };
 analytics: Array<{
  date: string;
  totalFollowers: number;
  newFollowers: number;
  unfollowers: number;
 }>;
 demographics: {
  last30Days: number;
  last60Days: number;
  older: number;
 };
}

interface SellerTierInfo {
 tierLevel: string;
 subscriberCount: number;
 trustScore: number;
 retentionRate: number;
 features: string[];
 nextTier: {
  name: string;
  required: number;
  benefits: string[];
 } | null;
}

interface FollowingStore {
 storeId: string;
 storeName: string;
 storeSlug: string;
 storeDescription: string | null;
 themeColor: string | null;
 followerCount: number;
 followedAt: string;
}

// Follow a seller/store
export const followSeller = async (storeId: string): Promise<{
 success: boolean;
 following: boolean;
 followerCount: number;
}> => {
 return fetchApi('/seller/follow', {
  method: 'POST',
  body: JSON.stringify({ storeId }),
 });
};

// Unfollow a seller/store
export const unfollowSeller = async (storeId: string): Promise<{
 success: boolean;
 following: boolean;
 followerCount: number;
}> => {
 return fetchApi('/seller/unfollow', {
  method: 'POST',
  body: JSON.stringify({ storeId }),
 });
};

// Check if user is following a store
export const checkFollowing = async (storeId: string): Promise<{
 following: boolean;
 followerCount: number;
}> => {
 return fetchApi(`/seller/following/${storeId}`);
};

// Get follower count for a store
export const getFollowerCount = async (storeId: string): Promise<{ followerCount: number }> => {
 return fetchApi(`/seller/followers/count/${storeId}`);
};

// Get followers list for a store (owner only)
export const getStoreFollowers = async (
 storeId: string,
 page: number = 1,
 limit: number = 20
): Promise<{
 followers: FollowerInfo[];
 pagination: {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
 };
}> => {
 const params = new URLSearchParams({
  page: page.toString(),
  limit: limit.toString(),
 });
 return fetchApi(`/seller/followers/${storeId}?${params}`);
};

// Get stores user is following
export const getFollowingStores = async (
 page: number = 1,
 limit: number = 20
): Promise<{
 following: FollowingStore[];
 pagination: {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
 };
}> => {
 const params = new URLSearchParams({
  page: page.toString(),
  limit: limit.toString(),
 });
 return fetchApi(`/seller/following?${params}`);
};

// Get follower analytics for seller's dashboard
export const getFollowerAnalytics = async (
 storeId: string,
 period: string = '30d'
): Promise<FollowerAnalyticsData> => {
 return fetchApi(`/seller/analytics/followers/${storeId}?period=${period}`);
};

// Get seller tier information
export const getSellerTier = async (storeId: string): Promise<SellerTierInfo> => {
 return fetchApi(`/seller/tier/${storeId}`);
};

export default {
 onboardSeller,
 getSellerStatus,
 getCommissions,
 getPayouts,
 getDashboardSummary,
 getDashboardLink,
 updateSellerPlan,
 formatCurrency,
 formatDate,
 getStatusColor,
 getCommissionRateDisplay,
 // Follower functions
 followSeller,
 unfollowSeller,
 checkFollowing,
 getFollowerCount,
 getStoreFollowers,
 getFollowingStores,
 getFollowerAnalytics,
 getSellerTier,
};
