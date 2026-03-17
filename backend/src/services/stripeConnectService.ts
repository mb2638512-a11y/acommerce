import Stripe from 'stripe';
import prisma from '../utils/prisma';

// Initialize Stripe with Connect secret key
const getStripeConnect = (): Stripe => {
 const secretKey = process.env.STRIPE_CONNECT_SECRET || process.env.STRIPE_SECRET_KEY;
 if (!secretKey) {
  throw new Error('STRIPE_CONNECT_SECRET or STRIPE_SECRET_KEY is not defined');
 }
 return new Stripe(secretKey, {
  apiVersion: '2023-10-16' as any,
 });
};

export interface CreateConnectAccountParams {
 email: string;
 businessName: string;
 country?: string;
}

export interface CreateAccountLinkParams {
 accountId: string;
 returnUrl: string;
 refreshUrl: string;
}

export interface AccountStatus {
 chargesEnabled: boolean;
 payoutsEnabled: boolean;
 detailsSubmitted: boolean;
}

export interface SplitPaymentParams {
 amount: number; // Amount in cents
 currency?: string;
 sellerStripeAccountId: string;
 platformFeePercent: number;
 metadata?: Record<string, string>;
}

export interface TransferParams {
 amount: number; // Amount in cents
 destinationAccount: string;
 currency?: string;
 description?: string;
 metadata?: Record<string, string>;
}

/**
 * Create a Stripe Connect Express account for a seller
 */
export const createConnectAccount = async (
 params: CreateConnectAccountParams
): Promise<Stripe.Account> => {
 const stripe = getStripeConnect();

 const account = await stripe.accounts.create({
  type: 'express',
  email: params.email,
  business_profile: {
   name: params.businessName,
  },
  capabilities: {
   card_payments: { requested: true },
   transfers: { requested: true },
  },
  metadata: {
   businessName: params.businessName,
  },
 });

 return account;
};

/**
 * Create an account link for onboarding flow
 */
export const createAccountLink = async (
 params: CreateAccountLinkParams
): Promise<Stripe.AccountLink> => {
 const stripe = getStripeConnect();

 const accountLink = await stripe.accountLinks.create({
  account: params.accountId,
  refresh_url: params.refreshUrl,
  return_url: params.returnUrl,
  type: 'account_onboarding',
 });

 return accountLink;
};

/**
 * Create a login link for accessing Stripe Express dashboard
 */
export const createLoginLink = async (
 accountId: string
): Promise<Stripe.LoginLink> => {
 const stripe = getStripeConnect();

 const loginLink = await stripe.accounts.createLoginLink(accountId);
 return loginLink;
};

/**
 * Get account status (onboarding progress)
 */
export const getAccountStatus = async (accountId: string): Promise<AccountStatus> => {
 const stripe = getStripeConnect();

 const account = await stripe.accounts.retrieve(accountId);

 return {
  chargesEnabled: account.charges_enabled || false,
  payoutsEnabled: account.payouts_enabled || false,
  detailsSubmitted: account.details_submitted || false,
 };
};

/**
 * Create a split payment using Stripe Connect
 * This charges the customer and splits the payment between platform and seller
 */
export const createSplitPayment = async (
 params: SplitPaymentParams
): Promise<Stripe.PaymentIntent> => {
 const stripe = getStripeConnect();

 const platformFee = Math.round(params.amount * (params.platformFeePercent / 100));

 const paymentIntent = await stripe.paymentIntents.create({
  amount: params.amount,
  currency: params.currency || 'usd',
  payment_method_types: ['card'],
  application_fee_amount: platformFee,
  transfer_data: {
   destination: params.sellerStripeAccountId,
  },
  metadata: params.metadata || {},
 });

 return paymentIntent;
};

/**
 * Create a direct transfer to a connected account
 */
export const createTransfer = async (
 params: TransferParams
): Promise<Stripe.Transfer> => {
 const stripe = getStripeConnect();

 const transfer = await stripe.transfers.create({
  amount: params.amount,
  currency: params.currency || 'usd',
  destination: params.destinationAccount,
  description: params.description,
  metadata: params.metadata || {},
 });

 return transfer;
};

/**
 * Get payout history for a connected account
 */
export const getPayouts = async (
 accountId: string,
 limit: number = 10
): Promise<Stripe.Payout[]> => {
 const stripe = getStripeConnect();

 const payouts = await stripe.payouts.list(
  { limit },
  { stripeAccount: accountId }
 );

 return payouts.data;
};

/**
 * Get balance for a connected account
 */
export const getAccountBalance = async (
 accountId: string
): Promise<Stripe.Balance> => {
 const stripe = getStripeConnect();

 const balance = await stripe.balance.retrieve({
  stripeAccount: accountId,
 });

 return balance;
};

/**
 * Create a checkout session with split payment
 */
export const createConnectCheckoutSession = async (
 params: {
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];
  sellerStripeAccountId: string;
  platformFeePercent: number;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
 }
): Promise<Stripe.Checkout.Session> => {
 const stripe = getStripeConnect();

 // Calculate the total amount from line items
 const amount = params.lineItems.reduce((total, item) => {
  const priceData = item.price_data as Stripe.Checkout.SessionCreateParams.LineItem.PriceData;
  const unitAmount = priceData?.unit_amount || 0;
  const quantity = item.quantity || 1;
  return total + (unitAmount * quantity);
 }, 0);

 // Calculate exact application fee based on amount
 const applicationFee = Math.round(amount * (params.platformFeePercent / 100));

 const session = await stripe.checkout.sessions.create({
  mode: 'payment',
  line_items: params.lineItems,
  payment_intent_data: {
   application_fee_amount: applicationFee,
   transfer_data: {
    destination: params.sellerStripeAccountId,
   },
   metadata: params.metadata || {},
  },
  success_url: params.successUrl,
  cancel_url: params.cancelUrl,
  customer_email: params.customerEmail,
  metadata: params.metadata || {},
 });

 return session;
};

/**
 * Calculate commission based on seller plan tier
 */
export const calculateCommission = (
 orderAmount: number,
 planTier: string
): { commission: number; sellerPayout: number; rate: number } => {
 const rates: Record<string, number> = {
  FREE: 0.05,    // 5% for free tier
  PRO: 0.02,     // 2% for pro tier
  PREMIUM: 0.01, // 1% for premium tier
  ENTERPRISE: 0, // 0% for enterprise
 };

 const rate = rates[planTier] || 0.05;
 const commission = orderAmount * rate;
 const sellerPayout = orderAmount - commission;

 return {
  commission: Math.round(commission * 100) / 100,
  sellerPayout: Math.round(sellerPayout * 100) / 100,
  rate,
 };
};

/**
 * Process commission payment for an order
 */
export const processOrderCommission = async (
 orderId: string,
 sellerId: string,
 orderAmount: number
): Promise<{
 commission: number;
 sellerPayout: number;
 rate: number;
 sellerAccountId: string | null;
}> => {
 // Get seller's Stripe Connect account
 const sellerAccount = await prisma.sellerAccount.findFirst({
  where: { userId: sellerId },
 });

 if (!sellerAccount) {
  // No seller account - no commission (platform sale)
  return {
   commission: 0,
   sellerPayout: orderAmount,
   rate: 0,
   sellerAccountId: null,
  };
 }

 const { commission, sellerPayout, rate } = calculateCommission(
  orderAmount,
  sellerAccount.planTier
 );

 // Create commission record
 await prisma.commission.create({
  data: {
   orderId,
   sellerId: sellerAccount.id,
   amount: orderAmount,
   commission,
   sellerPayout,
   status: 'PENDING',
  },
 });

 return {
  commission,
  sellerPayout,
  rate,
  sellerAccountId: sellerAccount.stripeAccountId,
 };
};

/**
 * Mark commission as paid (after successful transfer)
 */
export const markCommissionPaid = async (
 commissionId: string,
 stripeTransferId: string
): Promise<void> => {
 await prisma.commission.update({
  where: { id: commissionId },
  data: {
   status: 'PAID',
   stripeTransferId,
   paidAt: new Date(),
  },
 });
};

/**
 * Get commission summary for a seller
 */
export const getSellerCommissionSummary = async (
 sellerId: string
): Promise<{
 totalEarnings: number;
 pendingPayout: number;
 paidOut: number;
 failed: number;
 transactionCount: number;
}> => {
 const sellerAccount = await prisma.sellerAccount.findFirst({
  where: { userId: sellerId },
 });

 if (!sellerAccount) {
  return {
   totalEarnings: 0,
   pendingPayout: 0,
   paidOut: 0,
   failed: 0,
   transactionCount: 0,
  };
 }

 const commissions = await prisma.commission.findMany({
  where: { sellerId: sellerAccount.id },
 });

 return commissions.reduce(
  (acc, comm) => {
   acc.totalEarnings += comm.sellerPayout;
   acc.transactionCount += 1;

   if (comm.status === 'PENDING') {
    acc.pendingPayout += comm.sellerPayout;
   } else if (comm.status === 'PAID') {
    acc.paidOut += comm.sellerPayout;
   } else if (comm.status === 'FAILED') {
    acc.failed += comm.sellerPayout;
   }

   return acc;
  },
  {
   totalEarnings: 0,
   pendingPayout: 0,
   paidOut: 0,
   failed: 0,
   transactionCount: 0,
  }
 );
};

export default {
 createConnectAccount,
 createAccountLink,
 createLoginLink,
 getAccountStatus,
 createSplitPayment,
 createTransfer,
 getPayouts,
 getAccountBalance,
 createConnectCheckoutSession,
 calculateCommission,
 processOrderCommission,
 markCommissionPaid,
 getSellerCommissionSummary,
};
