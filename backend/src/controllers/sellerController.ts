import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';
import * as stripeConnectService from '../services/stripeConnectService';
import { z } from 'zod';

const onboardSellerSchema = z.object({
 businessName: z.string().min(1).max(100),
 returnUrl: z.string().url(),
 refreshUrl: z.string().url(),
});

/**
 * Start seller onboarding process
 * Creates a Stripe Connect account and generates onboarding link
 */
export const onboardSeller = async (req: AuthRequest, res: Response): Promise<void> => {
 try {
  const userId = req.user?.userId;
  if (!userId) {
   res.status(401).json({ error: 'Unauthorized' });
   return;
  }

  const data = onboardSellerSchema.parse(req.body);

  // Get user info
  const user = await prisma.user.findUnique({
   where: { id: userId },
   select: { email: true, name: true },
  });

  if (!user) {
   res.status(404).json({ error: 'User not found' });
   return;
  }

  // Check if seller account already exists
  const existingAccount = await prisma.sellerAccount.findFirst({
   where: { userId },
  });

  let stripeAccountId: string;
  let isNewAccount = false;

  if (existingAccount) {
   stripeAccountId = existingAccount.stripeAccountId;

   // Check if already fully onboarded
   const accountStatus = await stripeConnectService.getAccountStatus(stripeAccountId);
   if (accountStatus.detailsSubmitted && accountStatus.chargesEnabled) {
    res.status(400).json({
     error: 'Account already onboarded',
     status: accountStatus,
    });
    return;
   }
  } else {
   // Create new Connect account
   const stripeAccount = await stripeConnectService.createConnectAccount({
    email: user.email,
    businessName: data.businessName,
   });

   stripeAccountId = stripeAccount.id;
   isNewAccount = true;

   // Default to FREE tier (5% commission)
   const userPlan = 'FREE';
   const commissionRate = 0.05;

   // Create seller account in database
   await prisma.sellerAccount.create({
    data: {
     userId,
     stripeAccountId,
     commissionRate,
     planTier: userPlan,
     chargesEnabled: false,
     payoutsEnabled: false,
     detailsSubmitted: false,
    },
   });
  }

  // Create account link for onboarding
  const accountLink = await stripeConnectService.createAccountLink({
   accountId: stripeAccountId,
   returnUrl: data.returnUrl,
   refreshUrl: data.refreshUrl,
  });

  res.json({
   url: accountLink.url,
   stripeAccountId,
   isNewAccount,
  });
 } catch (error: any) {
  console.error('Error in onboardSeller:', error);

  if (error.name === 'ZodError') {
   res.status(400).json({ error: 'Validation error', details: error.errors });
   return;
  }

  res.status(500).json({ error: 'Failed to start onboarding' });
 }
};

/**
 * Get seller Connect account status
 */
export const getSellerStatus = async (req: AuthRequest, res: Response): Promise<void> => {
 try {
  const userId = req.user?.userId;
  if (!userId) {
   res.status(401).json({ error: 'Unauthorized' });
   return;
  }

  const sellerAccount = await prisma.sellerAccount.findFirst({
   where: { userId },
  });

  if (!sellerAccount) {
   res.json({
    hasAccount: false,
    chargesEnabled: false,
    payoutsEnabled: false,
    detailsSubmitted: false,
    commissionRate: 0.05,
    planTier: 'FREE',
   });
   return;
  }

  // Get fresh status from Stripe
  const stripeStatus = await stripeConnectService.getAccountStatus(
   sellerAccount.stripeAccountId
  );

  // Update local record
  await prisma.sellerAccount.update({
   where: { id: sellerAccount.id },
   data: {
    chargesEnabled: stripeStatus.chargesEnabled,
    payoutsEnabled: stripeStatus.payoutsEnabled,
    detailsSubmitted: stripeStatus.detailsSubmitted,
   },
  });

  res.json({
   hasAccount: true,
   stripeAccountId: sellerAccount.stripeAccountId,
   chargesEnabled: stripeStatus.chargesEnabled,
   payoutsEnabled: stripeStatus.payoutsEnabled,
   detailsSubmitted: stripeStatus.detailsSubmitted,
   commissionRate: sellerAccount.commissionRate,
   planTier: sellerAccount.planTier,
   createdAt: sellerAccount.createdAt,
  });
 } catch (error: any) {
  console.error('Error in getSellerStatus:', error);
  res.status(500).json({ error: 'Failed to get seller status' });
 }
};

/**
 * Get seller's commission history
 */
export const getCommissions = async (req: AuthRequest, res: Response): Promise<void> => {
 try {
  const userId = req.user?.userId;
  if (!userId) {
   res.status(401).json({ error: 'Unauthorized' });
   return;
  }

  const { page = '1', limit = '20', status } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  const sellerAccount = await prisma.sellerAccount.findFirst({
   where: { userId },
  });

  if (!sellerAccount) {
   res.status(404).json({ error: 'Seller account not found' });
   return;
  }

  const whereClause: any = { sellerId: sellerAccount.id };
  if (status && status !== 'ALL') {
   whereClause.status = status;
  }

  const [commissions, total] = await Promise.all([
   prisma.commission.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    skip: (pageNum - 1) * limitNum,
    take: limitNum,
   }),
   prisma.commission.count({ where: whereClause }),
  ]);

  res.json({
   commissions,
   pagination: {
    page: pageNum,
    limit: limitNum,
    total,
    totalPages: Math.ceil(total / limitNum),
   },
  });
 } catch (error: any) {
  console.error('Error in getCommissions:', error);
  res.status(500).json({ error: 'Failed to get commissions' });
 }
};

/**
 * Get seller's payout history from Stripe
 */
export const getPayouts = async (req: AuthRequest, res: Response): Promise<void> => {
 try {
  const userId = req.user?.userId;
  if (!userId) {
   res.status(401).json({ error: 'Unauthorized' });
   return;
  }

  const { limit = '10' } = req.query;
  const limitNum = parseInt(limit as string, 10);

  const sellerAccount = await prisma.sellerAccount.findFirst({
   where: { userId },
  });

  if (!sellerAccount) {
   res.status(404).json({ error: 'Seller account not found' });
   return;
  }

  if (!sellerAccount.payoutsEnabled) {
   res.json({
    payouts: [],
    message: 'Payouts not enabled yet',
   });
   return;
  }

  const payouts = await stripeConnectService.getPayouts(
   sellerAccount.stripeAccountId,
   limitNum
  );

  res.json({
   payouts: payouts.map((payout) => ({
    id: payout.id,
    amount: payout.amount / 100, // Convert from cents
    currency: payout.currency,
    status: payout.status,
    arrivalDate: payout.arrival_date ? new Date(payout.arrival_date * 1000) : null,
    created: payout.created ? new Date(payout.created * 1000) : null,
   })),
  });
 } catch (error: any) {
  console.error('Error in getPayouts:', error);
  res.status(500).json({ error: 'Failed to get payouts' });
 }
};

/**
 * Get seller's dashboard summary
 */
export const getDashboardSummary = async (req: AuthRequest, res: Response): Promise<void> => {
 try {
  const userId = req.user?.userId;
  if (!userId) {
   res.status(401).json({ error: 'Unauthorized' });
   return;
  }

  const sellerAccount = await prisma.sellerAccount.findFirst({
   where: { userId },
  });

  if (!sellerAccount) {
   res.json({
    hasAccount: false,
    summary: {
     totalEarnings: 0,
     pendingPayout: 0,
     paidOut: 0,
     failed: 0,
     transactionCount: 0,
    },
   });
   return;
  }

  // Get commission summary
  const summary = await stripeConnectService.getSellerCommissionSummary(userId);

  // Get Stripe account status
  const stripeStatus = await stripeConnectService.getAccountStatus(
   sellerAccount.stripeAccountId
  );

  // Get balance from Stripe
  let balance = { available: 0, pending: 0 };
  try {
   const stripeBalance = await stripeConnectService.getAccountBalance(
    sellerAccount.stripeAccountId
   );
   balance = {
    available: (stripeBalance.available[0]?.amount || 0) / 100,
    pending: (stripeBalance.pending[0]?.amount || 0) / 100,
   };
  } catch (e) {
   // Balance might not be available yet
  }

  res.json({
   hasAccount: true,
   accountStatus: stripeStatus,
   summary: {
    ...summary,
    balanceAvailable: balance.available,
    balancePending: balance.pending,
   },
  });
 } catch (error: any) {
  console.error('Error in getDashboardSummary:', error);
  res.status(500).json({ error: 'Failed to get dashboard summary' });
 }
};

/**
 * Create a Stripe dashboard login link for the seller
 */
export const getDashboardLink = async (req: AuthRequest, res: Response): Promise<void> => {
 try {
  const userId = req.user?.userId;
  if (!userId) {
   res.status(401).json({ error: 'Unauthorized' });
   return;
  }

  const sellerAccount = await prisma.sellerAccount.findFirst({
   where: { userId },
  });

  if (!sellerAccount) {
   res.status(404).json({ error: 'Seller account not found' });
   return;
  }

  const loginLink = await stripeConnectService.createLoginLink(
   sellerAccount.stripeAccountId
  );

  res.json({
   url: loginLink.url,
  });
 } catch (error: any) {
  console.error('Error in getDashboardLink:', error);
  res.status(500).json({ error: 'Failed to get dashboard link' });
 }
};

/**
 * Update seller's plan tier (usually called when user upgrades their plan)
 */
export const updateSellerPlan = async (req: AuthRequest, res: Response): Promise<void> => {
 try {
  const userId = req.user?.userId;
  if (!userId) {
   res.status(401).json({ error: 'Unauthorized' });
   return;
  }

  const { planTier } = req.body;

  if (!planTier || !['FREE', 'PRO', 'PREMIUM', 'ENTERPRISE'].includes(planTier)) {
   res.status(400).json({ error: 'Invalid plan tier' });
   return;
  }

  const sellerAccount = await prisma.sellerAccount.findFirst({
   where: { userId },
  });

  if (!sellerAccount) {
   res.status(404).json({ error: 'Seller account not found' });
   return;
  }

  // Calculate new commission rate based on plan
  const rates: Record<string, number> = {
   FREE: 0.05,
   PRO: 0.02,
   PREMIUM: 0.01,
   ENTERPRISE: 0,
  };

  const updatedAccount = await prisma.sellerAccount.update({
   where: { id: sellerAccount.id },
   data: {
    planTier,
    commissionRate: rates[planTier],
   },
  });

  res.json({
   success: true,
   planTier: updatedAccount.planTier,
   commissionRate: updatedAccount.commissionRate,
  });
 } catch (error: any) {
  console.error('Error in updateSellerPlan:', error);
  res.status(500).json({ error: 'Failed to update seller plan' });
 }
};

/**
 * Onboard with instant bank account verification via Stripe Connect
 * Steps: Email verified → Business info → Bank account → ID verification → Complete
 */
export const onboardWithBankVerification = async (req: AuthRequest, res: Response): Promise<void> => {
 try {
  const userId = req.user?.userId;
  if (!userId) {
   res.status(401).json({ error: 'Unauthorized' });
   return;
  }

  const { businessName, returnUrl, refreshUrl } = req.body;

  if (!businessName || !returnUrl || !refreshUrl) {
   res.status(400).json({ error: 'Missing required fields' });
   return;
  }

  // Get user info
  const user = await prisma.user.findUnique({
   where: { id: userId },
   select: { email: true, name: true, isVerified: true },
  });

  if (!user) {
   res.status(404).json({ error: 'User not found' });
   return;
  }

  // Check if email is verified (Step 1)
  if (!user.isVerified) {
   res.status(400).json({
    error: 'Email verification required first',
    currentStep: 'email_verification',
    message: 'Please verify your email before proceeding with seller onboarding'
   });
   return;
  }

  // Check existing seller account
  const existingAccount = await prisma.sellerAccount.findFirst({
   where: { userId },
  });

  let stripeAccountId: string;
  let isNewAccount = false;

  if (existingAccount) {
   stripeAccountId = existingAccount.stripeAccountId;

   // Check full onboarding status
   const accountStatus = await stripeConnectService.getAccountStatus(stripeAccountId);

   if (accountStatus.chargesEnabled && accountStatus.payoutsEnabled && accountStatus.detailsSubmitted) {
    res.json({
     alreadyOnboarded: true,
     status: 'COMPLETE',
     message: 'Account is fully set up',
     steps: {
      emailVerified: true,
      businessInfo: true,
      bankAccount: true,
      idVerification: true,
      complete: true
     }
    });
    return;
   }
  } else {
   // Create new Stripe Connect account
   const stripeAccount = await stripeConnectService.createConnectAccount({
    email: user.email,
    businessName,
   });

   stripeAccountId = stripeAccount.id;
   isNewAccount = true;

   // Default to FREE tier
   await prisma.sellerAccount.create({
    data: {
     userId,
     stripeAccountId,
     commissionRate: 0.05,
     planTier: 'FREE',
     chargesEnabled: false,
     payoutsEnabled: false,
     detailsSubmitted: false,
    },
   });
  }

  // Create account link for onboarding
  const accountLink = await stripeConnectService.createAccountLink({
   accountId: stripeAccountId,
   returnUrl,
   refreshUrl,
  });

  res.json({
   url: accountLink.url,
   stripeAccountId,
   isNewAccount,
   currentStep: 'bank_verification',
   steps: {
    emailVerified: user.isVerified,
    businessInfo: existingAccount?.detailsSubmitted || false,
    bankAccount: false,
    idVerification: false,
    complete: false
   }
  });
 } catch (error: any) {
  console.error('Error in onboardWithBankVerification:', error);
  res.status(500).json({ error: 'Failed to start bank verification onboarding' });
 }
};

/**
 * Get detailed onboarding status with all steps
 * Steps: Email verified → Business info → Bank account → ID verification → Complete
 */
export const getOnboardingStatus = async (req: AuthRequest, res: Response): Promise<void> => {
 try {
  const userId = req.user?.userId;
  if (!userId) {
   res.status(401).json({ error: 'Unauthorized' });
   return;
  }

  // Get user for email verification status
  const user = await prisma.user.findUnique({
   where: { id: userId },
   select: { email: true, isVerified: true, name: true },
  });

  if (!user) {
   res.status(404).json({ error: 'User not found' });
   return;
  }

  const sellerAccount = await prisma.sellerAccount.findFirst({
   where: { userId },
  });

  if (!sellerAccount) {
   res.json({
    hasAccount: false,
    emailVerified: user.isVerified,
    currentStep: 'start_onboarding',
    steps: {
     emailVerified: user.isVerified,
     businessInfo: false,
     bankAccount: false,
     idVerification: false,
     complete: false
    },
    message: 'Start your seller onboarding'
   });
   return;
  }

  // Get detailed Stripe account status
  const stripeStatus = await stripeConnectService.getAccountStatus(sellerAccount.stripeAccountId);

  // Determine current step based on Stripe status
  let currentStep = 'email_verification';
  if (stripeStatus.detailsSubmitted) currentStep = 'bank_account';
  if (stripeStatus.payoutsEnabled) currentStep = 'id_verification';
  if (stripeStatus.chargesEnabled && stripeStatus.payoutsEnabled && stripeStatus.detailsSubmitted) {
   currentStep = 'complete';
  }

  res.json({
   hasAccount: true,
   emailVerified: user.isVerified,
   stripeAccountId: sellerAccount.stripeAccountId,
   currentStep,
   steps: {
    emailVerified: user.isVerified,
    businessInfo: stripeStatus.detailsSubmitted,
    bankAccount: stripeStatus.payoutsEnabled,
    idVerification: stripeStatus.chargesEnabled,
    complete: stripeStatus.chargesEnabled && stripeStatus.payoutsEnabled && stripeStatus.detailsSubmitted
   },
   stripeStatus: {
    chargesEnabled: stripeStatus.chargesEnabled,
    payoutsEnabled: stripeStatus.payoutsEnabled,
    detailsSubmitted: stripeStatus.detailsSubmitted,
   },
   planTier: sellerAccount.planTier,
   commissionRate: sellerAccount.commissionRate,
   createdAt: sellerAccount.createdAt
  });
 } catch (error: any) {
  console.error('Error in getOnboardingStatus:', error);
  res.status(500).json({ error: 'Failed to get onboarding status' });
 }
};

/**
 * Refresh an expired account link for re-onboarding
 */
export const refreshAccountLink = async (req: AuthRequest, res: Response): Promise<void> => {
 try {
  const userId = req.user?.userId;
  if (!userId) {
   res.status(401).json({ error: 'Unauthorized' });
   return;
  }

  const { returnUrl, refreshUrl } = req.body;

  if (!returnUrl || !refreshUrl) {
   res.status(400).json({ error: 'Missing required fields: returnUrl, refreshUrl' });
   return;
  }

  const sellerAccount = await prisma.sellerAccount.findFirst({
   where: { userId },
  });

  if (!sellerAccount) {
   res.status(404).json({ error: 'Seller account not found. Please start onboarding first.' });
   return;
  }

  // Check current status
  const stripeStatus = await stripeConnectService.getAccountStatus(sellerAccount.stripeAccountId);

  // If already fully onboarded, return info message
  if (stripeStatus.chargesEnabled && stripeStatus.payoutsEnabled && stripeStatus.detailsSubmitted) {
   res.json({
    alreadyOnboarded: true,
    message: 'Your account is fully set up. No action needed.',
    stripeStatus
   });
   return;
  }

  // Create new account link
  const accountLink = await stripeConnectService.createAccountLink({
   accountId: sellerAccount.stripeAccountId,
   returnUrl,
   refreshUrl,
  });

  res.json({
   url: accountLink.url,
   stripeAccountId: sellerAccount.stripeAccountId,
   expiresAt: new Date(Date.now() + 5 * 60 * 1000),
   currentStep: stripeStatus.detailsSubmitted ? 'bank_account' : 'business_info'
  });
 } catch (error: any) {
  console.error('Error in refreshAccountLink:', error);
  res.status(500).json({ error: 'Failed to refresh account link' });
 }
};
