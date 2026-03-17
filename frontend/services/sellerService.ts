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
};
