import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';
import {
 moderateProduct,
 moderateBulkProducts,
 isModerationEnabled,
 shouldBlockProduct,
 ModerationResult
} from '../services/contentModerationService';

// Schema for product moderation check
const productModerationSchema = z.object({
 name: z.string().trim().min(1).max(140),
 description: z.string().max(4000).optional(),
 category: z.string().max(120).optional(),
 images: z.array(z.string().min(1)).optional(),
});

// Schema for bulk moderation
const bulkModerationSchema = z.object({
 products: z.array(productModerationSchema).min(1).max(50),
});

/**
 * POST /api/moderation/product
 * Check a single product for content policy violations
 */
export const checkProduct = async (req: AuthRequest, res: Response) => {
 try {
  // Check if moderation is enabled
  if (!isModerationEnabled()) {
   return res.json({
    isAllowed: true,
    category: 'Allowed',
    confidence: 0,
    flags: [],
    message: 'Content moderation is currently disabled',
   });
  }

  const product = productModerationSchema.parse(req.body);

  // Run moderation check - normalize optional fields to strings
  const result = await moderateProduct({
   name: product.name,
   description: product.description || '',
   category: product.category || '',
   images: product.images
  });

  // Log the moderation action
  await prisma.moderationLog.create({
   data: {
    action: 'PRODUCT_CHECKED',
    details: JSON.stringify({
     productName: product.name,
     category: product.category,
     result: {
      isAllowed: result.isAllowed,
      category: result.category,
      confidence: result.confidence,
     },
    }),
   },
  });

  res.json(result);
 } catch (error) {
  if (error instanceof z.ZodError) {
   return res.status(400).json({ error: 'Invalid product payload' });
  }
  console.error('Moderation error:', error);
  res.status(500).json({ error: 'Failed to check product' });
 }
};

/**
 * POST /api/moderation/bulk
 * Check multiple products for content policy violations
 */
export const checkBulkProducts = async (req: AuthRequest, res: Response) => {
 try {
  // Check if moderation is enabled
  if (!isModerationEnabled()) {
   return res.json({
    results: req.body.products?.map(() => ({
     isAllowed: true,
     category: 'Allowed',
     confidence: 0,
     flags: [],
     message: 'Content moderation is currently disabled',
    })) || [],
   });
  }

  const { products } = bulkModerationSchema.parse(req.body);

  // Run bulk moderation - normalize optional fields to strings
  const normalizedProducts = products.map(p => ({
   name: p.name,
   description: p.description || '',
   category: p.category || '',
   images: p.images
  }));
  const results = await moderateBulkProducts(normalizedProducts);

  // Log the bulk moderation action
  await prisma.moderationLog.create({
   data: {
    action: 'BULK_PRODUCTS_CHECKED',
    details: JSON.stringify({
     productCount: products.length,
     flaggedCount: results.filter(r => !r.isAllowed).length,
    }),
   },
  });

  res.json({ results });
 } catch (error) {
  if (error instanceof z.ZodError) {
   return res.status(400).json({ error: 'Invalid products payload' });
  }
  console.error('Bulk moderation error:', error);
  res.status(500).json({ error: 'Failed to check products' });
 }
};

/**
 * GET /api/moderation/flags
 * Get all flagged products (admin only)
 */
export const getModerationFlags = async (req: AuthRequest, res: Response) => {
 try {
  const { status, storeId, page = '1', limit = '20' } = req.query;

  const where: any = {};

  if (status) {
   where.status = status;
  }

  if (storeId) {
   where.storeId = storeId;
  } else {
   // If not filtering by storeId, get all flags
   where.status = { in: ['PENDING', 'FLAGGED'] };
  }

  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
  const take = parseInt(limit as string);

  const [flags, total] = await Promise.all([
   (prisma.moderationFlag as any).findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip,
    take,
    include: {
     store: {
      select: {
       id: true,
       name: true,
       slug: true,
      },
     },
    },
   }),
   prisma.moderationFlag.count({ where }),
  ]);

  res.json({
   flags,
   pagination: {
    page: parseInt(page as string),
    limit: parseInt(limit as string),
    total,
    pages: Math.ceil(total / parseInt(limit as string)),
   },
  });
 } catch (error) {
  console.error('Get flagged products error:', error);
  res.status(500).json({ error: 'Failed to get flagged products' });
 }
};

/**
 * GET /api/moderation/stats
 * Get moderation statistics (admin only)
 */
export const getModerationStats = async (req: AuthRequest, res: Response) => {
 try {
  const [
   totalFlags,
   pendingFlags,
   approvedCount,
   rejectedCount,
   recentFlags,
  ] = await Promise.all([
   prisma.moderationFlag.count(),
   prisma.moderationFlag.count({ where: { status: { in: ['PENDING', 'FLAGGED'] } } }),
   prisma.moderationFlag.count({ where: { status: 'APPROVED' } }),
   prisma.moderationFlag.count({ where: { status: 'REJECTED' } }),
   prisma.moderationFlag.findMany({
    where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    orderBy: { createdAt: 'desc' },
    take: 10,
   }),
  ]);

  // Get category breakdown
  const categoryBreakdown = await prisma.moderationFlag.groupBy({
   by: ['category'],
   where: { category: { not: null } },
   _count: true,
  });

  res.json({
   totalFlags,
   pendingFlags,
   approvedCount,
   rejectedCount,
   recentFlags,
   categoryBreakdown: categoryBreakdown.map((c: any) => ({
    category: c.category,
    count: c._count,
   })),
  });
 } catch (error) {
  console.error('Get moderation stats error:', error);
  res.status(500).json({ error: 'Failed to get moderation statistics' });
 }
};

/**
 * PUT /api/moderation/approve/:id
 * Approve a flagged product (admin only)
 */
export const approveFlaggedProduct = async (req: AuthRequest, res: Response) => {
 try {
  const { id } = req.params;
  const { note } = req.body;
  const moderatorId = req.user?.userId;

  const flag = await prisma.moderationFlag.findUnique({
   where: { id },
  });

  if (!flag) {
   return res.status(404).json({ error: 'Flag not found' });
  }

  // Update the flag status
  const [updatedFlag] = await Promise.all([
   prisma.moderationFlag.update({
    where: { id },
    data: {
     status: 'APPROVED',
     moderatorNote: note,
     reviewedBy: moderatorId,
     reviewedAt: new Date(),
    },
   }),
   prisma.product.update({
    where: { id: flag.productId },
    data: { status: 'ACTIVE' },
   }).catch(() => null), // Ignore if product doesn't exist
   prisma.moderationLog.create({
    data: {
     action: 'PRODUCT_APPROVED',
     productId: flag.productId,
     storeId: flag.storeId,
     moderatorId,
     details: JSON.stringify({ note, flagId: id }),
    },
   }),
  ]);

  res.json({
   message: 'Product approved successfully',
   flag: updatedFlag,
  });
 } catch (error) {
  console.error('Approve flagged product error:', error);
  res.status(500).json({ error: 'Failed to approve product' });
 }
};

/**
 * PUT /api/moderation/reject/:id
 * Reject a flagged product (admin only)
 */
export const rejectFlaggedProduct = async (req: AuthRequest, res: Response) => {
 try {
  const { id } = req.params;
  const { note } = req.body;
  const moderatorId = req.user?.userId;

  const flag = await prisma.moderationFlag.findUnique({
   where: { id },
  });

  if (!flag) {
   return res.status(404).json({ error: 'Flag not found' });
  }

  // Update the flag status and archive the product
  const [updatedFlag] = await Promise.all([
   prisma.moderationFlag.update({
    where: { id },
    data: {
     status: 'REJECTED',
     moderatorNote: note,
     reviewedBy: moderatorId,
     reviewedAt: new Date(),
    },
   }),
   prisma.product.update({
    where: { id: flag.productId },
    data: { status: 'ARCHIVED' },
   }).catch(() => null), // Ignore if product doesn't exist
   prisma.moderationLog.create({
    data: {
     action: 'PRODUCT_REJECTED',
     productId: flag.productId,
     storeId: flag.storeId,
     moderatorId,
     details: JSON.stringify({ note, flagId: id }),
    },
   }),
  ]);

  res.json({
   message: 'Product rejected and archived',
   flag: updatedFlag,
  });
 } catch (error) {
  console.error('Reject flagged product error:', error);
  res.status(500).json({ error: 'Failed to reject product' });
 }
};

/**
 * GET /api/moderation/logs
 * Get moderation action logs (admin only)
 */
export const getModerationLogs = async (req: AuthRequest, res: Response) => {
 try {
  const { action, page = '1', limit = '50' } = req.query;

  const where: any = {};
  if (action) {
   where.action = action;
  }

  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
  const take = parseInt(limit as string);

  const [logs, total] = await Promise.all([
   prisma.moderationLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip,
    take,
   }),
   prisma.moderationLog.count({ where }),
  ]);

  res.json({
   logs,
   pagination: {
    page: parseInt(page as string),
    limit: parseInt(limit as string),
    total,
    pages: Math.ceil(total / parseInt(limit as string)),
   },
  });
 } catch (error) {
  console.error('Get moderation logs error:', error);
  res.status(500).json({ error: 'Failed to get moderation logs' });
 }
};

/**
 * Helper function to create a flag for a product
 * This is called during product creation
 */
export const createProductFlag = async (
 productId: string,
 storeId: string,
 productName: string,
 productCategory: string | null,
 result: ModerationResult
) => {
 return prisma.moderationFlag.create({
  data: {
   productId,
   storeId,
   productName,
   productCategory,
   status: result.isAllowed ? 'APPROVED' : 'FLAGGED',
   flags: JSON.stringify(result.flags),
   confidence: result.confidence,
   category: result.category,
  },
 });
};
