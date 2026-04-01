import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';

// Validation schemas
const productRatingSchema = z.object({
 orderId: z.string().optional(),
 productId: z.string(),
 rating: z.number().min(1).max(5),
 title: z.string().optional(),
 content: z.string().optional(),
});

const sellerRatingSchema = z.object({
 sellerId: z.string(),
 rating: z.number().min(1).max(5),
 category: z.enum(['communication', 'shipping', 'product_accuracy']),
 comment: z.string().optional(),
});

/**
 * Rate a product (POST /api/ratings/product)
 */
export const rateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
 try {
  const userId = req.user?.userId;
  if (!userId) {
   res.status(401).json({ error: 'Unauthorized' });
   return;
  }

  const data = productRatingSchema.parse(req.body);

  // Verify product exists
  const product = await prisma.product.findUnique({
   where: { id: data.productId },
   select: { id: true, storeId: true },
  });

  if (!product) {
   res.status(404).json({ error: 'Product not found' });
   return;
  }

   // Check if user has purchased this product (for verified purchase badge)
   let isVerifiedPurchase = false;
   if (data.orderId) {
    const userEmail = req.user?.email;
    if (userEmail) {
     const order = await prisma.order.findFirst({
      where: {
       id: data.orderId,
       customerEmail: userEmail,
      },
      include: {
       items: {
        where: { productId: data.productId },
       },
      },
     });
      isVerifiedPurchase = !!order && order.items.length > 0;
     }
    }

   // Get sellerId from product's store
  const store = await prisma.store.findUnique({
   where: { id: product.storeId },
   select: { ownerId: true },
  });

  // Create or update review
  const existingReview = await prisma.review.findFirst({
   where: {
    productId: data.productId,
    buyerId: userId,
   },
  });

  let review;
  if (existingReview) {
   // Update existing review
   review = await prisma.review.update({
    where: { id: existingReview.id },
    data: {
     rating: data.rating,
     title: data.title,
     content: data.content,
     isVerifiedPurchase: isVerifiedPurchase || existingReview.isVerifiedPurchase,
     orderId: data.orderId || existingReview.orderId,
    },
   });
  } else {
   // Create new review
   review = await prisma.review.create({
    data: {
     productId: data.productId,
     buyerId: userId,
     sellerId: store?.ownerId || null,
     orderId: data.orderId,
     rating: data.rating,
     title: data.title,
     content: data.content,
      isVerifiedPurchase,
      customerName: req.user?.email?.split('@')[0] || 'Anonymous',
     },
   });
  }

  // Calculate new average rating for product
  const ratings = await prisma.review.aggregate({
   where: { productId: data.productId },
   _avg: { rating: true },
   _count: { rating: true },
  });

  res.json({
   success: true,
   review,
   productRating: {
    average: ratings._avg.rating || 0,
    count: ratings._count.rating,
   },
  });
 } catch (error: any) {
  console.error('Error in rateProduct:', error);

  if (error.name === 'ZodError') {
   res.status(400).json({ error: 'Validation error', details: error.errors });
   return;
  }

  res.status(500).json({ error: 'Failed to rate product' });
 }
};

/**
 * Rate a seller (POST /api/ratings/seller)
 */
export const rateSeller = async (req: AuthRequest, res: Response): Promise<void> => {
 try {
  const userId = req.user?.userId;
  if (!userId) {
   res.status(401).json({ error: 'Unauthorized' });
   return;
  }

  const data = sellerRatingSchema.parse(req.body);

  // Verify seller exists
  const sellerAccount = await prisma.sellerAccount.findFirst({
   where: { userId: data.sellerId },
   select: { id: true },
  });

  if (!sellerAccount) {
   res.status(404).json({ error: 'Seller not found' });
   return;
  }

  // Check if user has already rated this seller for the same category
  const existingRating = await prisma.sellerRating.findFirst({
   where: {
    sellerId: data.sellerId,
    buyerId: userId,
    category: data.category,
   },
  });

  let rating;
  if (existingRating) {
   // Update existing rating
   rating = await prisma.sellerRating.update({
    where: { id: existingRating.id },
    data: {
     rating: data.rating,
     comment: data.comment,
    },
   });
  } else {
   // Create new rating
   rating = await prisma.sellerRating.create({
    data: {
     sellerId: data.sellerId,
     buyerId: userId,
     rating: data.rating,
     category: data.category,
     comment: data.comment,
    },
   });
  }

  // Calculate new average ratings by category
  const categoryRatings = await prisma.sellerRating.groupBy({
   by: ['category'],
   where: { sellerId: data.sellerId },
   _avg: { rating: true },
   _count: { rating: true },
  });

  const overallRating = await prisma.sellerRating.aggregate({
   where: { sellerId: data.sellerId },
   _avg: { rating: true },
   _count: { rating: true },
  });

  res.json({
   success: true,
   rating,
   sellerRating: {
    overall: {
     average: overallRating._avg.rating || 0,
     count: overallRating._count.rating,
    },
    categories: categoryRatings.map((cr) => ({
     category: cr.category,
     average: cr._avg.rating,
     count: cr._count.rating,
    })),
   },
  });
 } catch (error: any) {
  console.error('Error in rateSeller:', error);

  if (error.name === 'ZodError') {
   res.status(400).json({ error: 'Validation error', details: error.errors });
   return;
  }

  res.status(500).json({ error: 'Failed to rate seller' });
 }
};

/**
 * Get product ratings (GET /api/ratings/product/:productId)
 */
export const getProductRatings = async (req: AuthRequest, res: Response): Promise<void> => {
 try {
  const { productId } = req.params;
  const { page = '1', limit = '10' } = req.query;

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  // Get product info
  const product = await prisma.product.findUnique({
   where: { id: productId },
   select: { id: true, name: true },
  });

  if (!product) {
   res.status(404).json({ error: 'Product not found' });
   return;
  }

  // Get ratings statistics
  const [ratings, total] = await Promise.all([
   prisma.review.findMany({
    where: { productId },
    orderBy: { createdAt: 'desc' },
    skip: (pageNum - 1) * limitNum,
    take: limitNum,
   }),
   prisma.review.count({ where: { productId } }),
  ]);

  // Calculate average by star rating
  const starDistribution = await prisma.review.groupBy({
   by: ['rating'],
   where: { productId },
   _count: { rating: true },
  });

  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  starDistribution.forEach((sd) => {
   distribution[sd.rating] = sd._count.rating;
  });

  const averageRating = await prisma.review.aggregate({
   where: { productId },
   _avg: { rating: true },
  });

  res.json({
   product: {
    id: product.id,
    name: product.name,
   },
   ratings,
   statistics: {
    average: averageRating._avg.rating || 0,
    total,
    distribution,
   },
   pagination: {
    page: pageNum,
    limit: limitNum,
    total,
    totalPages: Math.ceil(total / limitNum),
   },
  });
 } catch (error: any) {
  console.error('Error in getProductRatings:', error);
  res.status(500).json({ error: 'Failed to get product ratings' });
 }
};

/**
 * Get seller ratings (GET /api/ratings/seller/:sellerId)
 */
export const getSellerRatings = async (req: AuthRequest, res: Response): Promise<void> => {
 try {
  const { sellerId } = req.params;
  const { page = '1', limit = '10', category } = req.query;

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

   // Get seller info
   const sellerAccount = await prisma.sellerAccount.findFirst({
    where: { userId: sellerId },
    include: {
     user: {
      select: { name: true },
     },
    },
   });

  if (!sellerAccount) {
   res.status(404).json({ error: 'Seller not found' });
   return;
  }

  // Build where clause
  const whereClause: any = { sellerId };
  if (category && category !== 'all') {
   whereClause.category = category;
  }

  // Get ratings
  const [ratings, total] = await Promise.all([
   prisma.sellerRating.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    skip: (pageNum - 1) * limitNum,
    take: limitNum,
   }),
   prisma.sellerRating.count({ where: whereClause }),
  ]);

  // Get category breakdown
  const categoryBreakdown = await prisma.sellerRating.groupBy({
   by: ['category'],
   where: { sellerId },
   _avg: { rating: true },
   _count: { rating: true },
  });

  // Get overall stats
  const overallStats = await prisma.sellerRating.aggregate({
   where: { sellerId },
   _avg: { rating: true },
   _count: { rating: true },
  });

  res.json({
   seller: {
    id: sellerAccount.userId,
    name: sellerAccount.user?.name || 'Unknown',
   },
   ratings,
   statistics: {
    overall: {
     average: overallStats._avg.rating || 0,
     count: overallStats._count.rating,
    },
    categories: categoryBreakdown.map((cb) => ({
     category: cb.category,
     average: cb._avg.rating,
     count: cb._count.rating,
    })),
   },
   pagination: {
    page: pageNum,
    limit: limitNum,
    total,
    totalPages: Math.ceil(total / limitNum),
   },
  });
 } catch (error: any) {
  console.error('Error in getSellerRatings:', error);
  res.status(500).json({ error: 'Failed to get seller ratings' });
 }
};

// ============================================
// Enhanced Feedback System Endpoints
// ============================================

// Validation schemas for feedback
const feedbackSchema = z.object({
 type: z.enum(['PRODUCT', 'SELLER', 'PLATFORM', 'SHIPPING', 'CUSTOMER_SERVICE']),
 targetId: z.string(),
 rating: z.number().min(1).max(5),
 category: z.string().optional(),
 title: z.string().optional(),
 content: z.string().min(1, 'Content is required'),
 pros: z.string().optional(),
 cons: z.string().optional(),
 images: z.string().optional(),
});

const feedbackResponseSchema = z.object({
 content: z.string().min(1, 'Response content is required'),
});

const feedbackVoteSchema = z.object({
 vote: z.number().min(-1).max(1),
});

/**
 * Create feedback (POST /api/feedback)
 */
export const createFeedback = async (req: AuthRequest, res: Response): Promise<void> => {
 try {
  const userId = req.user?.userId;
  if (!userId) {
   res.status(401).json({ error: 'Unauthorized' });
   return;
  }

  const data = feedbackSchema.parse(req.body);

  // Verify target exists based on type
  let isVerified = false;
  if (data.type === 'PRODUCT') {
   const product = await prisma.product.findUnique({
    where: { id: data.targetId },
    select: { id: true, storeId: true },
   });
   if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
   }
    // Check if user has purchased
    const userEmail = req.user?.email;
    if (userEmail) {
     const order = await prisma.order.findFirst({
      where: {
       customerEmail: userEmail,
       items: { some: { productId: data.targetId } },
      },
     });
      isVerified = !!order;
     }
   } else if (data.type === 'SELLER') {
   const seller = await prisma.sellerAccount.findFirst({
    where: { userId: data.targetId },
    select: { id: true },
   });
   if (!seller) {
    res.status(404).json({ error: 'Seller not found' });
    return;
   }
  }

  // Check for existing feedback from user for same target
  const existingFeedback = await prisma.feedback.findFirst({
   where: {
    userId,
    type: data.type,
    targetId: data.targetId,
   },
  });

  let feedback;
  if (existingFeedback) {
   feedback = await prisma.feedback.update({
    where: { id: existingFeedback.id },
    data: {
     rating: data.rating,
     category: data.category,
     title: data.title,
     content: data.content,
     pros: data.pros,
     cons: data.cons,
     images: data.images,
     isVerified: isVerified || existingFeedback.isVerified,
    },
   });
  } else {
   feedback = await prisma.feedback.create({
    data: {
     type: data.type,
     targetId: data.targetId,
     userId,
     rating: data.rating,
     category: data.category,
     title: data.title,
     content: data.content,
     pros: data.pros,
     cons: data.cons,
     images: data.images,
     isVerified,
    },
   });
  }

  res.json({
   success: true,
   feedback,
  });
 } catch (error: any) {
  console.error('Error in createFeedback:', error);

  if (error.name === 'ZodError') {
   res.status(400).json({ error: 'Validation error', details: error.errors });
   return;
  }

  res.status(500).json({ error: 'Failed to create feedback' });
 }
};

/**
 * Respond to feedback (POST /api/feedback/:id/respond)
 */
export const respondToFeedback = async (req: AuthRequest, res: Response): Promise<void> => {
 try {
  const userId = req.user?.userId;
  if (!userId) {
   res.status(401).json({ error: 'Unauthorized' });
   return;
  }

  const { id } = req.params;
  const data = feedbackResponseSchema.parse(req.body);

  const feedback = await prisma.feedback.findUnique({
   where: { id },
   select: { id: true, type: true, targetId: true },
  });

  if (!feedback) {
   res.status(404).json({ error: 'Feedback not found' });
   return;
  }

  // Verify user is the owner of the target
  let isAuthorized = false;
  if (feedback.type === 'SELLER') {
   const sellerAccount = await prisma.sellerAccount.findFirst({
    where: { userId: feedback.targetId },
    select: { userId: true },
   });
   isAuthorized = sellerAccount?.userId === userId;
  } else if (feedback.type === 'PRODUCT') {
   const product = await prisma.product.findUnique({
    where: { id: feedback.targetId },
    select: { storeId: true },
   });
   if (product) {
    const store = await prisma.store.findUnique({
     where: { id: product.storeId },
     select: { ownerId: true },
    });
    isAuthorized = store?.ownerId === userId;
   }
  }

   if (req.user?.role === 'admin') {
   isAuthorized = true;
  }

  if (!isAuthorized) {
   res.status(403).json({ error: 'Not authorized to respond to this feedback' });
   return;
  }

  const user = await prisma.user.findUnique({
   where: { id: userId },
   select: { name: true },
  });

  const response = await prisma.feedbackResponse.create({
   data: {
    feedbackId: id,
    userId,
    userName: user?.name || 'Seller',
    content: data.content,
   },
  });

  res.json({
   success: true,
   response,
  });
 } catch (error: any) {
  console.error('Error in respondToFeedback:', error);

  if (error.name === 'ZodError') {
   res.status(400).json({ error: 'Validation error', details: error.errors });
   return;
  }

  res.status(500).json({ error: 'Failed to respond to feedback' });
 }
};

/**
 * Vote on feedback (POST /api/feedback/:id/vote)
 */
export const voteFeedback = async (req: AuthRequest, res: Response): Promise<void> => {
 try {
  const userId = req.user?.userId;
  if (!userId) {
   res.status(401).json({ error: 'Unauthorized' });
   return;
  }

  const { id } = req.params;
  const data = feedbackVoteSchema.parse(req.body);

  const feedback = await prisma.feedback.findUnique({
   where: { id },
   select: { id: true },
  });

  if (!feedback) {
   res.status(404).json({ error: 'Feedback not found' });
   return;
  }

  const existingVote = await prisma.feedbackVote.findUnique({
   where: {
    feedbackId_userId: {
     feedbackId: id,
     userId,
    },
   },
  });

  let vote;
  if (existingVote) {
   vote = await prisma.feedbackVote.update({
    where: { id: existingVote.id },
    data: { vote: data.vote },
   });
  } else {
   vote = await prisma.feedbackVote.create({
    data: {
     feedbackId: id,
     userId,
     vote: data.vote,
    },
   });
  }

  const voteStats = await prisma.feedbackVote.aggregate({
   where: { feedbackId: id },
   _sum: { vote: true },
  });

  await prisma.feedback.update({
   where: { id },
   data: { helpfulCount: voteStats._sum.vote || 0 },
  });

  res.json({
   success: true,
   vote,
   helpfulCount: voteStats._sum.vote || 0,
  });
 } catch (error: any) {
  console.error('Error in voteFeedback:', error);

  if (error.name === 'ZodError') {
   res.status(400).json({ error: 'Validation error', details: error.errors });
   return;
  }

  res.status(500).json({ error: 'Failed to vote on feedback' });
 }
};

/**
 * Get seller feedback with categories (GET /api/feedback/seller/:sellerId)
 */
export const getSellerFeedback = async (req: AuthRequest, res: Response): Promise<void> => {
 try {
  const { sellerId } = req.params;
  const { page = '1', limit = '10', category, rating, status } = req.query;

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  const whereClause: any = {
   type: 'SELLER',
   targetId: sellerId,
  };

  if (category && category !== 'all') {
   whereClause.category = category;
  }

  if (rating) {
   whereClause.rating = parseInt(rating as string, 10);
  }

  if (status) {
   whereClause.status = status;
  } else {
   whereClause.status = 'PUBLISHED';
  }

  const [feedback, total] = await Promise.all([
   prisma.feedback.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    skip: (pageNum - 1) * limitNum,
    take: limitNum,
    include: {
     responses: true,
    },
   }),
   prisma.feedback.count({ where: whereClause }),
  ]);

  const [categoryStats, ratingStats, overallStats] = await Promise.all([
   prisma.feedback.groupBy({
    by: ['category'],
    where: { type: 'SELLER', targetId: sellerId, status: 'PUBLISHED' },
    _avg: { rating: true },
    _count: { id: true },
   }),
   prisma.feedback.groupBy({
    by: ['rating'],
    where: { type: 'SELLER', targetId: sellerId, status: 'PUBLISHED' },
    _count: { id: true },
   }),
   prisma.feedback.aggregate({
    where: { type: 'SELLER', targetId: sellerId, status: 'PUBLISHED' },
    _avg: { rating: true },
    _count: { id: true },
   }),
  ]);

  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratingStats.forEach((rs) => {
   distribution[rs.rating] = rs._count.id;
  });

  res.json({
   feedback,
   statistics: {
    overall: {
     average: overallStats._avg.rating || 0,
     count: overallStats._count.id,
    },
    categories: categoryStats.map((cs) => ({
     category: cs.category,
     average: cs._avg.rating,
     count: cs._count.id,
    })),
    distribution,
   },
   pagination: {
    page: pageNum,
    limit: limitNum,
    total,
    totalPages: Math.ceil(total / limitNum),
   },
  });
 } catch (error: any) {
  console.error('Error in getSellerFeedback:', error);
  res.status(500).json({ error: 'Failed to get seller feedback' });
 }
};

/**
 * Get product feedback (GET /api/feedback/product/:productId)
 */
export const getProductFeedback = async (req: AuthRequest, res: Response): Promise<void> => {
 try {
  const { productId } = req.params;
  const { page = '1', limit = '10', rating, status } = req.query;

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  const whereClause: any = {
   type: 'PRODUCT',
   targetId: productId,
  };

  if (rating) {
   whereClause.rating = parseInt(rating as string, 10);
  }

  if (status) {
   whereClause.status = status;
  } else {
   whereClause.status = 'PUBLISHED';
  }

  const [feedback, total] = await Promise.all([
   prisma.feedback.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    skip: (pageNum - 1) * limitNum,
    take: limitNum,
    include: {
     responses: true,
    },
   }),
   prisma.feedback.count({ where: whereClause }),
  ]);

  const [ratingStats, overallStats] = await Promise.all([
   prisma.feedback.groupBy({
    by: ['rating'],
    where: { type: 'PRODUCT', targetId: productId, status: 'PUBLISHED' },
    _count: { id: true },
   }),
   prisma.feedback.aggregate({
    where: { type: 'PRODUCT', targetId: productId, status: 'PUBLISHED' },
    _avg: { rating: true },
    _count: { id: true },
   }),
  ]);

  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratingStats.forEach((rs) => {
   distribution[rs.rating] = rs._count.id;
  });

  res.json({
   feedback,
   statistics: {
    average: overallStats._avg.rating || 0,
    count: overallStats._count.id,
    distribution,
   },
   pagination: {
    page: pageNum,
    limit: limitNum,
    total,
    totalPages: Math.ceil(total / limitNum),
   },
  });
 } catch (error: any) {
  console.error('Error in getProductFeedback:', error);
  res.status(500).json({ error: 'Failed to get product feedback' });
 }
};

/**
 * Get feedback analytics for seller (GET /api/feedback/analytics/:sellerId)
 */
export const getFeedbackAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
 try {
  const { sellerId } = req.params;
  const { period = '30' } = req.query;
  const days = parseInt(period as string, 10);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const sellerAccount = await prisma.sellerAccount.findFirst({
   where: { userId: sellerId },
   select: { id: true },
  });

  if (!sellerAccount) {
   res.status(404).json({ error: 'Seller not found' });
   return;
  }

  const [allFeedback, recentFeedback, responseCount] = await Promise.all([
   prisma.feedback.findMany({
    where: {
     type: 'SELLER',
     targetId: sellerId,
     status: 'PUBLISHED',
    },
    orderBy: { createdAt: 'desc' },
   }),
   prisma.feedback.findMany({
    where: {
     type: 'SELLER',
     targetId: sellerId,
     status: 'PUBLISHED',
     createdAt: { gte: startDate },
    },
    orderBy: { createdAt: 'desc' },
   }),
   prisma.feedbackResponse.count({
    where: {
     feedback: {
      type: 'SELLER',
      targetId: sellerId,
     },
    },
   }),
  ]);

  const categoryMap: Record<string, { total: number; count: number }> = {};
  allFeedback.forEach((f) => {
   const cat = f.category || 'overall';
   if (!categoryMap[cat]) {
    categoryMap[cat] = { total: 0, count: 0 };
   }
   categoryMap[cat].total += f.rating;
   categoryMap[cat].count += 1;
  });

  const categoryAverages = Object.entries(categoryMap).map(([cat, data]) => ({
   category: cat,
   average: data.count > 0 ? data.total / data.count : 0,
   count: data.count,
  }));

  const overallAverage = allFeedback.length > 0
   ? allFeedback.reduce((sum, f) => sum + f.rating, 0) / allFeedback.length
   : 0;

  const totalFeedback = allFeedback.length;
  const responseRate = totalFeedback > 0 ? (responseCount / totalFeedback) * 100 : 0;

  const midDate = new Date();
  midDate.setDate(midDate.getDate() - days * 2);

  const recentPeriod = allFeedback.filter((f) => f.createdAt >= startDate);
  const previousPeriod = allFeedback.filter((f) => f.createdAt >= midDate && f.createdAt < startDate);

  const recentAvg = recentPeriod.length > 0
   ? recentPeriod.reduce((sum, f) => sum + f.rating, 0) / recentPeriod.length
   : 0;
  const previousAvg = previousPeriod.length > 0
   ? previousPeriod.reduce((sum, f) => sum + f.rating, 0) / previousPeriod.length
   : 0;

  let trend: 'improving' | 'declining' | 'stable' = 'stable';
  if (recentAvg - previousAvg > 0.2) {
   trend = 'improving';
  } else if (previousAvg - recentAvg > 0.2) {
   trend = 'declining';
  }

  const marketplaceAvgResult = await prisma.feedback.aggregate({
   where: {
    type: 'SELLER',
    status: 'PUBLISHED',
   },
   _avg: { rating: true },
  });
  const marketplaceAverage = marketplaceAvgResult._avg.rating || 0;

  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  allFeedback.forEach((f) => {
   distribution[f.rating]++;
  });

  const feedbackWithResponses = await prisma.feedback.findMany({
   where: {
    type: 'SELLER',
    targetId: sellerId,
    status: 'PUBLISHED',
   },
   orderBy: { createdAt: 'desc' },
   take: 5,
   include: {
    responses: true,
   },
  });

  res.json({
   summary: {
    totalFeedback,
    averageRating: overallAverage,
    responseRate,
    responseCount,
    trend,
    trendChange: recentAvg - previousAvg,
    comparisonToMarketplace: overallAverage - marketplaceAverage,
   },
   categories: categoryAverages,
   distribution,
   recentFeedback: feedbackWithResponses,
   period: days,
  });
 } catch (error: any) {
  console.error('Error in getFeedbackAnalytics:', error);
  res.status(500).json({ error: 'Failed to get feedback analytics' });
 }
};
