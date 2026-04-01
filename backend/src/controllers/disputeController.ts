import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';

// Validation schemas
const createDisputeSchema = z.object({
 orderId: z.string(),
 reason: z.enum(['not_received', 'not_as_described', 'damaged', 'other']),
 description: z.string().min(20, 'Description must be at least 20 characters'),
 evidenceUrls: z.array(z.string().url()).optional(),
});

const respondDisputeSchema = z.object({
 response: z.string().min(10, 'Response must be at least 10 characters'),
});

const resolveDisputeSchema = z.object({
 resolution: z.string(),
 refundAmount: z.number().min(0).optional(),
 status: z.enum(['RESOLVED', 'CLOSED']),
});

/**
 * Open a new dispute (POST /api/disputes)
 */
export const createDispute = async (req: AuthRequest, res: Response): Promise<void> => {
 try {
  const userId = req.user?.userId;
  if (!userId) {
   res.status(401).json({ error: 'Unauthorized' });
   return;
  }

  const data = createDisputeSchema.parse(req.body);

   // Verify order exists and belongs to user
   const order = await prisma.order.findUnique({
    where: { id: data.orderId },
    include: {
     store: {
      select: { ownerId: true },
     },
    },
   });

  if (!order) {
   res.status(404).json({ error: 'Order not found' });
   return;
  }

   // Check if user is the buyer
   const userEmail = req.user?.email;
   if (!userEmail || userEmail !== order.customerEmail) {
    res.status(403).json({ error: 'You can only open disputes for your own orders' });
    return;
   }

  // Check if dispute already exists for this order
  const existingDispute = await prisma.dispute.findFirst({
   where: {
    orderId: data.orderId,
    buyerId: userId,
    status: { notIn: ['CLOSED'] },
   },
  });

  if (existingDispute) {
   res.status(400).json({
    error: 'A dispute already exists for this order',
    disputeId: existingDispute.id,
   });
   return;
  }

  // Create the dispute
  const dispute = await prisma.dispute.create({
   data: {
    orderId: data.orderId,
    buyerId: userId,
    sellerId: order.store.ownerId,
    reason: data.reason,
    description: data.description,
    status: 'OPEN',
    evidenceUrls: data.evidenceUrls ? JSON.stringify(data.evidenceUrls) : null,
   },
  });

  // Update order status
  await prisma.order.update({
   where: { id: data.orderId },
   data: { status: 'DISPUTED' },
  });

  res.status(201).json({
   success: true,
   dispute: {
    ...dispute,
    evidenceUrls: dispute.evidenceUrls ? JSON.parse(dispute.evidenceUrls) : [],
   },
  });
 } catch (error: any) {
  console.error('Error in createDispute:', error);

  if (error.name === 'ZodError') {
   res.status(400).json({ error: 'Validation error', details: error.errors });
   return;
  }

  res.status(500).json({ error: 'Failed to create dispute' });
 }
};

/**
 * Get dispute details (GET /api/disputes/:id)
 */
export const getDispute = async (req: AuthRequest, res: Response): Promise<void> => {
 try {
  const userId = req.user?.userId;
  if (!userId) {
   res.status(401).json({ error: 'Unauthorized' });
   return;
  }

  const { id } = req.params;

  const dispute = await prisma.dispute.findUnique({
   where: { id },
  });

  if (!dispute) {
   res.status(404).json({ error: 'Dispute not found' });
   return;
  }

   // Check if user is involved in the dispute
   const userRole = req.user?.role;
   if (dispute.buyerId !== userId && dispute.sellerId !== userId && userRole !== 'admin') {
    res.status(403).json({ error: 'Not authorized to view this dispute' });
    return;
   }

  // Get order details
  const order = await prisma.order.findUnique({
   where: { id: dispute.orderId },
   select: {
    id: true,
    total: true,
    items: {
     include: {
      product: {
       select: { name: true, images: true },
      },
     },
    },
   },
  });

  res.json({
   dispute: {
    ...dispute,
    evidenceUrls: dispute.evidenceUrls ? JSON.parse(dispute.evidenceUrls) : [],
   },
   order,
  });
 } catch (error: any) {
  console.error('Error in getDispute:', error);
  res.status(500).json({ error: 'Failed to get dispute' });
 }
};

/**
 * Seller responds to dispute (PUT /api/disputes/:id/respond)
 */
export const respondToDispute = async (req: AuthRequest, res: Response): Promise<void> => {
 try {
  const userId = req.user?.userId;
  if (!userId) {
   res.status(401).json({ error: 'Unauthorized' });
   return;
  }

  const { id } = req.params;
  const data = respondDisputeSchema.parse(req.body);

  const dispute = await prisma.dispute.findUnique({
   where: { id },
  });

  if (!dispute) {
   res.status(404).json({ error: 'Dispute not found' });
   return;
  }

  // Only seller can respond
  if (dispute.sellerId !== userId) {
   res.status(403).json({ error: 'Only the seller can respond to this dispute' });
   return;
  }

  // Can only respond to open or under review disputes
  if (!['OPEN', 'UNDER_REVIEW'].includes(dispute.status)) {
   res.status(400).json({ error: 'Cannot respond to a closed dispute' });
   return;
  }

  const updatedDispute = await prisma.dispute.update({
   where: { id },
   data: {
    sellerResponse: data.response,
    status: 'UNDER_REVIEW',
   },
  });

  res.json({
   success: true,
   dispute: updatedDispute,
  });
 } catch (error: any) {
  console.error('Error in respondToDispute:', error);

  if (error.name === 'ZodError') {
   res.status(400).json({ error: 'Validation error', details: error.errors });
   return;
  }

  res.status(500).json({ error: 'Failed to respond to dispute' });
 }
};

/**
 * Admin resolves dispute (PUT /api/disputes/:id/resolve)
 */
export const resolveDispute = async (req: AuthRequest, res: Response): Promise<void> => {
 try {
  const userId = req.user?.userId;
  if (!userId) {
   res.status(401).json({ error: 'Unauthorized' });
   return;
  }

   // Only admins can resolve disputes
   const userRole = req.user?.role;
   if (userRole !== 'admin') {
    res.status(403).json({ error: 'Only administrators can resolve disputes' });
    return;
   }

  const { id } = req.params;
  const data = resolveDisputeSchema.parse(req.body);

  const dispute = await prisma.dispute.findUnique({
   where: { id },
  });

  if (!dispute) {
   res.status(404).json({ error: 'Dispute not found' });
   return;
  }

  const updatedDispute = await prisma.dispute.update({
   where: { id },
   data: {
    resolution: data.resolution,
    refundAmount: data.refundAmount,
    status: data.status,
    resolvedAt: new Date(),
   },
  });

  // Update order status based on resolution
  const newOrderStatus = data.status === 'RESOLVED' && data.refundAmount && data.refundAmount > 0
   ? 'REFUNDED'
   : 'DISPUTE_RESOLVED';

  await prisma.order.update({
   where: { id: dispute.orderId },
   data: { status: newOrderStatus },
  });

  res.json({
   success: true,
   dispute: updatedDispute,
  });
 } catch (error: any) {
  console.error('Error in resolveDispute:', error);

  if (error.name === 'ZodError') {
   res.status(400).json({ error: 'Validation error', details: error.errors });
   return;
  }

  res.status(500).json({ error: 'Failed to resolve dispute' });
 }
};

/**
 * Get seller's disputes (GET /api/disputes/seller/:sellerId)
 */
export const getSellerDisputes = async (req: AuthRequest, res: Response): Promise<void> => {
 try {
  const userId = req.user?.userId;
  if (!userId) {
   res.status(401).json({ error: 'Unauthorized' });
   return;
  }

  const { sellerId } = req.params;
  const { page = '1', limit = '10', status } = req.query;

   // Users can only see their own disputes (seller)
   const userRole = req.user?.role;
   if (sellerId !== userId && userRole !== 'admin') {
   res.status(403).json({ error: 'Not authorized' });
   return;
  }

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  const whereClause: any = { sellerId };
  if (status && status !== 'all') {
   whereClause.status = status;
  }

   const [disputes, total] = await Promise.all([
    prisma.dispute.findMany({
     where: whereClause,
     orderBy: { createdAt: 'desc' },
     skip: (pageNum - 1) * limitNum,
     take: limitNum,
     include: {
      order: true,
     },
    }),
    prisma.dispute.count({ where: whereClause }),
   ]);

   res.json({
    disputes,
    pagination: {
     page: pageNum,
     limit: limitNum,
     total,
     totalPages: Math.ceil(total / limitNum),
    },
   });
  } catch (error: any) {
   console.error('Error in getSellerDisputes:', error);
   res.status(500).json({ error: 'Failed to get seller disputes' });
  }
};

/**
 * Get buyer's disputes (GET /api/disputes/buyer/:buyerId)
 */
export const getBuyerDisputes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
   const userId = req.user?.userId;
   if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
   }

   const { buyerId } = req.params;
   const { page = '1', limit = '10', status } = req.query;

   // Users can only see their own disputes (buyer)
   const userRole = req.user?.role;
   if (buyerId !== userId && userRole !== 'admin') {
   res.status(403).json({ error: 'Not authorized' });
   return;
  }

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  const whereClause: any = { buyerId };
  if (status && status !== 'all') {
   whereClause.status = status;
  }

  const [disputes, total] = await Promise.all([
   prisma.dispute.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    skip: (pageNum - 1) * limitNum,
    take: limitNum,
    include: {
     order: true,
    },
   }),
   prisma.dispute.count({ where: whereClause }),
  ]);

  res.json({
   disputes,
   pagination: {
    page: pageNum,
    limit: limitNum,
    total,
    totalPages: Math.ceil(total / limitNum),
   },
  });
 } catch (error: any) {
  console.error('Error in getBuyerDisputes:', error);
  res.status(500).json({ error: 'Failed to get buyer disputes' });
 }
};

/**
 * Get all disputes (Admin only) (GET /api/disputes)
 */
export const getAllDisputes = async (req: AuthRequest, res: Response): Promise<void> => {
 try {
   if (req.user?.role !== 'admin') {
   res.status(403).json({ error: 'Admin access required' });
   return;
  }

  const { page = '1', limit = '20', status, reason } = req.query;

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  const whereClause: any = {};
  if (status && status !== 'all') {
   whereClause.status = status;
  }
  if (reason) {
   whereClause.reason = reason;
  }

  const [disputes, total] = await Promise.all([
   prisma.dispute.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    skip: (pageNum - 1) * limitNum,
    take: limitNum,
    include: {
     order: true,
    },
   }),
   prisma.dispute.count({ where: whereClause }),
  ]);

  res.json({
   disputes,
   pagination: {
    page: pageNum,
    limit: limitNum,
    total,
    totalPages: Math.ceil(total / limitNum),
   },
  });
 } catch (error: any) {
  console.error('Error in getBuyerDisputes:', error);
  res.status(500).json({ error: 'Failed to get buyer disputes' });
 }
};
