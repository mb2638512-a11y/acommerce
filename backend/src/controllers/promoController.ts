import { Response } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import { isPlanTier, PLATFORM_PLANS } from '../config/platformPlans';

// Validation schemas
const createPromoCodeSchema = z.object({
 code: z.string().min(3).max(50).toUpperCase(),
 description: z.string().optional(),
 discountType: z.enum(['PERCENTAGE', 'FIXED']),
 discountValue: z.number().positive(),
 minPurchase: z.number().optional(),
 maxUses: z.number().optional(),
 maxUsesPerUser: z.number().optional(),
 expiresAt: z.string().optional(), // ISO date string
 applicablePlans: z.array(z.string())
});

const updatePromoCodeSchema = z.object({
 description: z.string().optional(),
 discountType: z.enum(['PERCENTAGE', 'FIXED']).optional(),
 discountValue: z.number().positive().optional(),
 minPurchase: z.number().optional(),
 maxUses: z.number().optional(),
 maxUsesPerUser: z.number().optional(),
 expiresAt: z.string().optional(),
 applicablePlans: z.array(z.string()).optional(),
 isActive: z.boolean().optional()
});

const validatePromoCodeSchema = z.object({
 code: z.string().min(3).max(50).toUpperCase(),
 tier: z.string()
});

// Check if user is admin
const isAdmin = (role?: string) => role === 'ADMIN' || role === 'admin';

// ==================== Admin Endpoints ====================

// Create a new promo code (admin only)
export const createPromoCode = async (req: AuthRequest, res: Response) => {
 try {
  if (!isAdmin(req.user?.role)) {
   return res.status(403).json({ error: 'Admin access required' });
  }

  const data = createPromoCodeSchema.parse(req.body);

  // Validate applicable plans
  const invalidPlans = data.applicablePlans.filter(plan => !isPlanTier(plan));
  if (invalidPlans.length > 0) {
   return res.status(400).json({ error: `Invalid plan tiers: ${invalidPlans.join(', ')}` });
  }

  // Check if code already exists
  const existingCode = await prisma.promoCode.findUnique({
   where: { code: data.code }
  });

  if (existingCode) {
   return res.status(400).json({ error: 'Promo code already exists' });
  }

  // Validate discount values
  if (data.discountType === 'PERCENTAGE' && data.discountValue > 100) {
   return res.status(400).json({ error: 'Percentage discount cannot exceed 100%' });
  }

  const promoCode = await prisma.promoCode.create({
   data: {
    code: data.code,
    description: data.description,
    discountType: data.discountType,
    discountValue: data.discountValue,
    minPurchase: data.minPurchase,
    maxUses: data.maxUses,
    maxUsesPerUser: data.maxUsesPerUser,
    expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    applicablePlans: JSON.stringify(data.applicablePlans),
    isActive: true
   }
  });

  res.status(201).json({
   id: promoCode.id,
   code: promoCode.code,
   description: promoCode.description,
   discountType: promoCode.discountType,
   discountValue: promoCode.discountValue,
   minPurchase: promoCode.minPurchase,
   maxUses: promoCode.maxUses,
   usedCount: promoCode.usedCount,
   maxUsesPerUser: promoCode.maxUsesPerUser,
   startsAt: promoCode.startsAt,
   expiresAt: promoCode.expiresAt,
   isActive: promoCode.isActive,
   applicablePlans: JSON.parse(promoCode.applicablePlans)
  });
 } catch (error) {
  if (error instanceof z.ZodError) {
   return res.status(400).json({ error: error.errors });
  }
  console.error('Create promo code error:', error);
  res.status(500).json({ error: 'Failed to create promo code' });
 }
};

// Get all promo codes (admin only)
export const getAllPromoCodes = async (req: AuthRequest, res: Response) => {
 try {
  if (!isAdmin(req.user?.role)) {
   return res.status(403).json({ error: 'Admin access required' });
  }

  const promoCodes = await prisma.promoCode.findMany({
   orderBy: { createdAt: 'desc' },
   include: {
    usage: {
     orderBy: { createdAt: 'desc' },
     take: 10
    }
   }
  });

  const formattedCodes = promoCodes.map(code => ({
   id: code.id,
   code: code.code,
   description: code.description,
   discountType: code.discountType,
   discountValue: code.discountValue,
   minPurchase: code.minPurchase,
   maxUses: code.maxUses,
   usedCount: code.usedCount,
   maxUsesPerUser: code.maxUsesPerUser,
   startsAt: code.startsAt,
   expiresAt: code.expiresAt,
   isActive: code.isActive,
   applicablePlans: JSON.parse(code.applicablePlans),
   createdAt: code.createdAt,
   usageCount: code.usage.length,
   recentUsage: code.usage.slice(0, 5).map(u => ({
    userId: u.userId,
    tier: u.tier,
    discountAmount: u.discountAmount,
    createdAt: u.createdAt
   }))
  }));

  res.json(formattedCodes);
 } catch (error) {
  console.error('Get all promo codes error:', error);
  res.status(500).json({ error: 'Failed to fetch promo codes' });
 }
};

// Get promo code by ID (admin only)
export const getPromoCodeById = async (req: AuthRequest, res: Response) => {
 try {
  if (!isAdmin(req.user?.role)) {
   return res.status(403).json({ error: 'Admin access required' });
  }

  const { id } = req.params;

  const promoCode = await prisma.promoCode.findUnique({
   where: { id },
   include: {
    usage: {
     orderBy: { createdAt: 'desc' }
    }
   }
  });

  if (!promoCode) {
   return res.status(404).json({ error: 'Promo code not found' });
  }

  res.json({
   id: promoCode.id,
   code: promoCode.code,
   description: promoCode.description,
   discountType: promoCode.discountType,
   discountValue: promoCode.discountValue,
   minPurchase: promoCode.minPurchase,
   maxUses: promoCode.maxUses,
   usedCount: promoCode.usedCount,
   maxUsesPerUser: promoCode.maxUsesPerUser,
   startsAt: promoCode.startsAt,
   expiresAt: promoCode.expiresAt,
   isActive: promoCode.isActive,
   applicablePlans: JSON.parse(promoCode.applicablePlans),
   createdAt: promoCode.createdAt,
   usage: promoCode.usage.map(u => ({
    id: u.id,
    userId: u.userId,
    storeId: u.storeId,
    tier: u.tier,
    discountAmount: u.discountAmount,
    createdAt: u.createdAt
   }))
  });
 } catch (error) {
  console.error('Get promo code by ID error:', error);
  res.status(500).json({ error: 'Failed to fetch promo code' });
 }
};

// Update promo code (admin only)
export const updatePromoCode = async (req: AuthRequest, res: Response) => {
 try {
  if (!isAdmin(req.user?.role)) {
   return res.status(403).json({ error: 'Admin access required' });
  }

  const { id } = req.params;
  const data = updatePromoCodeSchema.parse(req.body);

  const existingCode = await prisma.promoCode.findUnique({
   where: { id }
  });

  if (!existingCode) {
   return res.status(404).json({ error: 'Promo code not found' });
  }

  // Validate applicable plans if provided
  if (data.applicablePlans) {
   const invalidPlans = data.applicablePlans.filter(plan => !isPlanTier(plan));
   if (invalidPlans.length > 0) {
    return res.status(400).json({ error: `Invalid plan tiers: ${invalidPlans.join(', ')}` });
   }
  }

  // Validate discount values
  if (data.discountType === 'PERCENTAGE' && data.discountValue && data.discountValue > 100) {
   return res.status(400).json({ error: 'Percentage discount cannot exceed 100%' });
  }

  const updateData: any = { ...data };

  if (data.applicablePlans) {
   updateData.applicablePlans = JSON.stringify(data.applicablePlans);
  }

  if (data.expiresAt) {
   updateData.expiresAt = new Date(data.expiresAt);
  } else if (data.expiresAt === null) {
   updateData.expiresAt = null;
  }

  const promoCode = await prisma.promoCode.update({
   where: { id },
   data: updateData
  });

  res.json({
   id: promoCode.id,
   code: promoCode.code,
   description: promoCode.description,
   discountType: promoCode.discountType,
   discountValue: promoCode.discountValue,
   minPurchase: promoCode.minPurchase,
   maxUses: promoCode.maxUses,
   usedCount: promoCode.usedCount,
   maxUsesPerUser: promoCode.maxUsesPerUser,
   startsAt: promoCode.startsAt,
   expiresAt: promoCode.expiresAt,
   isActive: promoCode.isActive,
   applicablePlans: JSON.parse(promoCode.applicablePlans)
  });
 } catch (error) {
  if (error instanceof z.ZodError) {
   return res.status(400).json({ error: error.errors });
  }
  console.error('Update promo code error:', error);
  res.status(500).json({ error: 'Failed to update promo code' });
 }
};

// Delete promo code (admin only)
export const deletePromoCode = async (req: AuthRequest, res: Response) => {
 try {
  if (!isAdmin(req.user?.role)) {
   return res.status(403).json({ error: 'Admin access required' });
  }

  const { id } = req.params;

  const existingCode = await prisma.promoCode.findUnique({
   where: { id }
  });

  if (!existingCode) {
   return res.status(404).json({ error: 'Promo code not found' });
  }

  await prisma.promoCode.delete({
   where: { id }
  });

  res.json({ message: 'Promo code deleted successfully' });
 } catch (error) {
  console.error('Delete promo code error:', error);
  res.status(500).json({ error: 'Failed to delete promo code' });
 }
};

// Toggle promo code active status (admin only)
export const togglePromoCodeStatus = async (req: AuthRequest, res: Response) => {
 try {
  if (!isAdmin(req.user?.role)) {
   return res.status(403).json({ error: 'Admin access required' });
  }

  const { id } = req.params;

  const existingCode = await prisma.promoCode.findUnique({
   where: { id }
  });

  if (!existingCode) {
   return res.status(404).json({ error: 'Promo code not found' });
  }

  const promoCode = await prisma.promoCode.update({
   where: { id },
   data: { isActive: !existingCode.isActive }
  });

  res.json({
   id: promoCode.id,
   code: promoCode.code,
   isActive: promoCode.isActive
  });
 } catch (error) {
  console.error('Toggle promo code status error:', error);
  res.status(500).json({ error: 'Failed to toggle promo code status' });
 }
};

// Get promo code statistics (admin only)
export const getPromoCodeStats = async (req: AuthRequest, res: Response) => {
 try {
  if (!isAdmin(req.user?.role)) {
   return res.status(403).json({ error: 'Admin access required' });
  }

  const promoCodes = await prisma.promoCode.findMany();

  const totalCodes = promoCodes.length;
  const activeCodes = promoCodes.filter(c => c.isActive).length;
  const expiredCodes = promoCodes.filter(c => c.expiresAt && new Date(c.expiresAt) < new Date()).length;
  const totalUsage = promoCodes.reduce((sum, c) => sum + c.usedCount, 0);

  // Get usage in last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentUsage = await prisma.promoCodeUsage.count({
   where: {
    createdAt: { gte: thirtyDaysAgo }
   }
  });

  // Get total discount given
  const usageAggregate = await prisma.promoCodeUsage.aggregate({
   _sum: {
    discountAmount: true
   }
  });

  res.json({
   totalCodes,
   activeCodes,
   expiredCodes,
   totalUsage,
   recentUsage,
   totalDiscountGiven: usageAggregate._sum.discountAmount || 0,
   byPlan: promoCodes.map(c => ({
    code: c.code,
    usedCount: c.usedCount,
    applicablePlans: JSON.parse(c.applicablePlans)
   }))
  });
 } catch (error) {
  console.error('Get promo code stats error:', error);
  res.status(500).json({ error: 'Failed to fetch promo code statistics' });
 }
};

// ==================== Public/User Endpoints ====================

// Validate a promo code
export const validatePromoCode = async (req: AuthRequest, res: Response) => {
 try {
  const { code, tier } = validatePromoCodeSchema.parse(req.body);

  const promoCode = await prisma.promoCode.findUnique({
   where: { code: code.toUpperCase() }
  });

  if (!promoCode) {
   return res.status(404).json({ error: 'Promo code not found', valid: false });
  }

  // Check if active
  if (!promoCode.isActive) {
   return res.status(400).json({ error: 'Promo code is not active', valid: false });
  }

  // Check if expired
  if (promoCode.expiresAt && new Date(promoCode.expiresAt) < new Date()) {
   return res.status(400).json({ error: 'Promo code has expired', valid: false });
  }

  // Check if started
  if (new Date(promoCode.startsAt) > new Date()) {
   return res.status(400).json({ error: 'Promo code is not yet active', valid: false });
  }

  // Check max uses
  if (promoCode.maxUses && promoCode.usedCount >= promoCode.maxUses) {
   return res.status(400).json({ error: 'Promo code usage limit reached', valid: false });
  }

  // Check applicable plans
  const applicablePlans = JSON.parse(promoCode.applicablePlans) as string[];
  if (!applicablePlans.includes(tier)) {
   return res.status(400).json({
    error: `Promo code not applicable for ${tier} plan`,
    valid: false,
    applicablePlans
   });
  }

  // Check per-user usage limit if user is authenticated
  if (req.user?.userId && promoCode.maxUsesPerUser) {
   const userUsageCount = await prisma.promoCodeUsage.count({
    where: {
     promoCodeId: promoCode.id,
     userId: req.user.userId
    }
   });

   if (userUsageCount >= promoCode.maxUsesPerUser) {
    return res.status(400).json({
     error: 'You have already used this promo code',
     valid: false
    });
   }
  }

  // Return calculated discount
  const planPrice = PLATFORM_PLANS[tier as keyof typeof PLATFORM_PLANS]?.monthlyPriceUsd || 0;
  let discountAmount = 0;

  if (promoCode.discountType === 'PERCENTAGE') {
   discountAmount = (planPrice * promoCode.discountValue) / 100;
  } else {
   discountAmount = promoCode.discountValue;
  }

  // Cap discount at plan price
  discountAmount = Math.min(discountAmount, planPrice);

  res.json({
   valid: true,
   code: promoCode.code,
   description: promoCode.description,
   discountType: promoCode.discountType,
   discountValue: promoCode.discountValue,
   discountAmount: Math.round(discountAmount * 100) / 100,
   finalPrice: Math.round((planPrice - discountAmount) * 100) / 100,
   originalPrice: planPrice,
   applicablePlans,
   expiresAt: promoCode.expiresAt
  });
 } catch (error) {
  if (error instanceof z.ZodError) {
   return res.status(400).json({ error: error.errors });
  }
  console.error('Validate promo code error:', error);
  res.status(500).json({ error: 'Failed to validate promo code', valid: false });
 }
};

// Record promo code usage (called after successful subscription)
export const recordPromoCodeUsage = async (
 userId: string,
 promoCodeId: string,
 storeId: string | null,
 tier: string,
 discountAmount: number
) => {
 try {
  await prisma.promoCodeUsage.create({
   data: {
    promoCodeId,
    userId,
    storeId,
    tier,
    discountAmount
   }
  });

  // Increment used count
  await prisma.promoCode.update({
   where: { id: promoCodeId },
   data: { usedCount: { increment: 1 } }
  });

  return true;
 } catch (error) {
  console.error('Record promo code usage error:', error);
  return false;
 }
};
