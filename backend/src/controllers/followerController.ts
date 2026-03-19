import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';

/**
 * Follow a seller (store)
 */
export const followSeller = async (req: AuthRequest, res: Response): Promise<void> => {
 try {
  const userId = req.user?.userId;
  if (!userId) {
   res.status(401).json({ error: 'Unauthorized' });
   return;
  }

  const { storeId } = req.body;

  if (!storeId) {
   res.status(400).json({ error: 'Store ID is required' });
   return;
  }

  // Check if store exists
  const store = await prisma.store.findUnique({
   where: { id: storeId },
   select: { id: true, ownerId: true, name: true },
  });

  if (!store) {
   res.status(404).json({ error: 'Store not found' });
   return;
  }

  // Check if user is the store owner
  if (store.ownerId === userId) {
   res.status(400).json({ error: 'You cannot follow your own store' });
   return;
  }

  // Check if already following
  const existingFollow = await prisma.sellerFollower.findUnique({
   where: {
    followerId_storeId: {
     followerId: userId,
     storeId: storeId,
    },
   },
  });

  if (existingFollow) {
   res.status(400).json({ error: 'Already following this store' });
   return;
  }

  // Create the follow relationship
  const follow = await prisma.sellerFollower.create({
   data: {
    followerId: userId,
    storeId: storeId,
    followingId: store.ownerId, // The store owner being followed
   },
  });

  // Update follower count
  const followerCount = await prisma.sellerFollower.count({
   where: { storeId },
  });

  // Record analytics
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.followerAnalytics.upsert({
   where: {
    storeId_date: {
     storeId: storeId,
     date: today,
    },
   },
   update: {
    newFollowers: { increment: 1 },
    totalFollowers: followerCount,
   },
   create: {
    storeId: storeId,
    date: today,
    newFollowers: 1,
    totalFollowers: followerCount,
   },
  });

  // Update or create seller tier
  await updateSellerTier(storeId);

  res.status(201).json({
   success: true,
   following: true,
   followerCount,
  });
 } catch (error: any) {
  console.error('Error in followSeller:', error);
  res.status(500).json({ error: 'Failed to follow seller' });
 }
};

/**
 * Unfollow a seller (store)
 */
export const unfollowSeller = async (req: AuthRequest, res: Response): Promise<void> => {
 try {
  const userId = req.user?.userId;
  if (!userId) {
   res.status(401).json({ error: 'Unauthorized' });
   return;
  }

  const { storeId } = req.body;

  if (!storeId) {
   res.status(400).json({ error: 'Store ID is required' });
   return;
  }

  // Check if following exists
  const existingFollow = await prisma.sellerFollower.findUnique({
   where: {
    followerId_storeId: {
     followerId: userId,
     storeId: storeId,
    },
   },
  });

  if (!existingFollow) {
   res.status(400).json({ error: 'Not following this store' });
   return;
  }

  // Delete the follow relationship
  await prisma.sellerFollower.delete({
   where: {
    followerId_storeId: {
     followerId: userId,
     storeId: storeId,
    },
   },
  });

  // Update follower count
  const followerCount = await prisma.sellerFollower.count({
   where: { storeId },
  });

  // Record analytics
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.followerAnalytics.upsert({
   where: {
    storeId_date: {
     storeId: storeId,
     date: today,
    },
   },
   update: {
    unfollowers: { increment: 1 },
    totalFollowers: followerCount,
   },
   create: {
    storeId: storeId,
    date: today,
    unfollowers: 1,
    totalFollowers: followerCount,
   },
  });

  // Update or create seller tier
  await updateSellerTier(storeId);

  res.json({
   success: true,
   following: false,
   followerCount,
  });
 } catch (error: any) {
  console.error('Error in unfollowSeller:', error);
  res.status(500).json({ error: 'Failed to unfollow seller' });
 }
};

/**
 * Check if user is following a store
 */
export const checkFollowing = async (req: AuthRequest, res: Response): Promise<void> => {
 try {
  const userId = req.user?.userId;
  const { storeId } = req.params;

  if (!storeId) {
   res.status(400).json({ error: 'Store ID is required' });
   return;
  }

  if (!userId) {
   res.json({ following: false, followerCount: 0 });
   return;
  }

  const follow = await prisma.sellerFollower.findUnique({
   where: {
    followerId_storeId: {
     followerId: userId,
     storeId: storeId,
    },
   },
  });

  const followerCount = await prisma.sellerFollower.count({
   where: { storeId },
  });

  res.json({
   following: !!follow,
   followerCount,
  });
 } catch (error: any) {
  console.error('Error in checkFollowing:', error);
  res.status(500).json({ error: 'Failed to check follow status' });
 }
};

/**
 * Get follower count for a store
 */
export const getFollowerCount = async (req: AuthRequest, res: Response): Promise<void> => {
 try {
  const { storeId } = req.params;

  if (!storeId) {
   res.status(400).json({ error: 'Store ID is required' });
   return;
  }

  const followerCount = await prisma.sellerFollower.count({
   where: { storeId },
  });

  res.json({ followerCount });
 } catch (error: any) {
  console.error('Error in getFollowerCount:', error);
  res.status(500).json({ error: 'Failed to get follower count' });
 }
};

/**
 * Get followers list for a store
 */
export const getStoreFollowers = async (req: AuthRequest, res: Response): Promise<void> => {
 try {
  const userId = req.user?.userId;
  const { storeId } = req.params;
  const { page = '1', limit = '20' } = req.query;

  if (!storeId) {
   res.status(400).json({ error: 'Store ID is required' });
   return;
  }

  // Check if user owns the store
  const store = await prisma.store.findUnique({
   where: { id: storeId },
   select: { ownerId: true },
  });

  if (!store) {
   res.status(404).json({ error: 'Store not found' });
   return;
  }

  // Only store owner can see full follower list
  if (store.ownerId !== userId) {
   res.status(403).json({ error: 'Not authorized to view follower list' });
   return;
  }

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  const [followers, total] = await Promise.all([
   prisma.sellerFollower.findMany({
    where: { storeId },
    include: {
     follower: {
      select: {
       id: true,
       name: true,
       email: true,
       avatar: true,
       createdAt: true,
      },
     },
    },
    orderBy: { createdAt: 'desc' },
    skip: (pageNum - 1) * limitNum,
    take: limitNum,
   }),
   prisma.sellerFollower.count({ where: { storeId } }),
  ]);

  res.json({
   followers: followers.map(f => ({
    id: f.id,
    userId: f.followerId,
    name: f.follower.name,
    email: f.follower.email,
    avatar: f.follower.avatar,
    followedAt: f.createdAt,
   })),
   pagination: {
    page: pageNum,
    limit: limitNum,
    total,
    totalPages: Math.ceil(total / limitNum),
   },
  });
 } catch (error: any) {
  console.error('Error in getStoreFollowers:', error);
  res.status(500).json({ error: 'Failed to get followers' });
 }
};

/**
 * Get stores that a user is following
 */
export const getFollowingStores = async (req: AuthRequest, res: Response): Promise<void> => {
 try {
  const userId = req.user?.userId;

  if (!userId) {
   res.status(401).json({ error: 'Unauthorized' });
   return;
  }

  const { page = '1', limit = '20' } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  const [following, total] = await Promise.all([
   prisma.sellerFollower.findMany({
    where: { followerId: userId },
    include: {
     store: {
      select: {
       id: true,
       name: true,
       slug: true,
       description: true,
       themeColor: true,
      },
     },
    },
    orderBy: { createdAt: 'desc' },
    skip: (pageNum - 1) * limitNum,
    take: limitNum,
   }),
   prisma.sellerFollower.count({ where: { followerId: userId } }),
  ]);

  // Get follower counts for each store
  const storeIds = following.map(f => f.storeId);
  const followerCounts = await prisma.sellerFollower.groupBy({
   by: ['storeId'],
   where: { storeId: { in: storeIds } },
   _count: true,
  });

  const countMap = new Map(followerCounts.map(f => [f.storeId, f._count]));

  res.json({
   following: following.map(f => ({
    storeId: f.store.id,
    storeName: f.store.name,
    storeSlug: f.store.slug,
    storeDescription: f.store.description,
    themeColor: f.store.themeColor,
    followerCount: countMap.get(f.store.id) || 0,
    followedAt: f.createdAt,
   })),
   pagination: {
    page: pageNum,
    limit: limitNum,
    total,
    totalPages: Math.ceil(total / limitNum),
   },
  });
 } catch (error: any) {
  console.error('Error in getFollowingStores:', error);
  res.status(500).json({ error: 'Failed to get following stores' });
 }
};

/**
 * Get follower analytics for seller's dashboard
 */
export const getFollowerAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
 try {
  const userId = req.user?.userId;
  const { storeId } = req.params;
  const { period = '30d' } = req.query;

  if (!userId) {
   res.status(401).json({ error: 'Unauthorized' });
   return;
  }

  // Verify store ownership
  const store = await prisma.store.findUnique({
   where: { id: storeId },
   select: { ownerId: true },
  });

  if (!store) {
   res.status(404).json({ error: 'Store not found' });
   return;
  }

  if (store.ownerId !== userId) {
   res.status(403).json({ error: 'Not authorized' });
   return;
  }

  // Calculate date range
  const now = new Date();
  let startDate = new Date();
  switch (period) {
   case '7d':
    startDate.setDate(now.getDate() - 7);
    break;
   case '30d':
    startDate.setDate(now.getDate() - 30);
    break;
   case '90d':
    startDate.setDate(now.getDate() - 90);
    break;
   default:
    startDate.setDate(now.getDate() - 30);
  }

  // Get analytics data
  const analytics = await prisma.followerAnalytics.findMany({
   where: {
    storeId,
    date: { gte: startDate },
   },
   orderBy: { date: 'asc' },
  });

  // Get total follower count
  const totalFollowers = await prisma.sellerFollower.count({
   where: { storeId },
  });

  // Calculate growth
  const totalNewFollowers = analytics.reduce((sum, a) => sum + a.newFollowers, 0);
  const totalUnfollowers = analytics.reduce((sum, a) => sum + a.unfollowers, 0);
  const netGrowth = totalNewFollowers - totalUnfollowers;

  // Calculate retention rate (simplified)
  const retentionRate = totalFollowers > 0
   ? ((totalFollowers - totalUnfollowers) / Math.max(totalFollowers, 1)) * 100
   : 100;

  // Get follower demographics (if available - based on user data)
  const followers = await prisma.sellerFollower.findMany({
   where: { storeId },
   include: {
    follower: {
     select: {
      createdAt: true,
     },
    },
   },
   take: 1000,
  });

  // Calculate follower join date distribution
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const recentFollowers = followers.filter(f => new Date(f.createdAt) >= thirtyDaysAgo).length;
  const mediumFollowers = followers.filter(f => {
   const date = new Date(f.createdAt);
   return date >= sixtyDaysAgo && date < thirtyDaysAgo;
  }).length;
  const olderFollowers = followers.filter(f => new Date(f.createdAt) < sixtyDaysAgo).length;

  res.json({
   totalFollowers,
   periodStats: {
    newFollowers: totalNewFollowers,
    unfollowers: totalUnfollowers,
    netGrowth,
    retentionRate: parseFloat(retentionRate.toFixed(2)),
   },
   analytics: analytics.map(a => ({
    date: a.date,
    totalFollowers: a.totalFollowers,
    newFollowers: a.newFollowers,
    unfollowers: a.unfollowers,
   })),
   demographics: {
    last30Days: recentFollowers,
    last60Days: mediumFollowers,
    older: olderFollowers,
   },
  });
 } catch (error: any) {
  console.error('Error in getFollowerAnalytics:', error);
  res.status(500).json({ error: 'Failed to get follower analytics' });
 }
};

/**
 * Helper function to update seller tier based on follower count
 */
async function updateSellerTier(storeId: string): Promise<void> {
 const followerCount = await prisma.sellerFollower.count({
  where: { storeId },
 });

 // Determine tier based on follower count
 let tierLevel = 'TIER_1';
 let features: string[] = ['basic_store', 'standard_support'];

 if (followerCount >= 1000) {
  tierLevel = 'TIER_4';
  features = ['basic_store', 'standard_support', 'premium_branding', 'marketing_insights', 'priority_placement', 'api_access'];
 } else if (followerCount >= 500) {
  tierLevel = 'TIER_3';
  features = ['basic_store', 'standard_support', 'premium_branding', 'marketing_insights'];
 } else if (followerCount >= 100) {
  tierLevel = 'TIER_2';
  features = ['basic_store', 'standard_support', 'premium_branding'];
 }

 // Calculate trust score and retention rate
 const today = new Date();
 today.setHours(0, 0, 0, 0);
 const thirtyDaysAgo = new Date(today);
 thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

 const recentAnalytics = await prisma.followerAnalytics.findMany({
  where: {
   storeId,
   date: { gte: thirtyDaysAgo },
  },
 });

 const totalNew = recentAnalytics.reduce((sum, a) => sum + a.newFollowers, 0);
 const totalLeft = recentAnalytics.reduce((sum, a) => sum + a.unfollowers, 0);

 const retentionRate = totalNew > 0
  ? ((totalNew - totalLeft) / totalNew) * 100
  : (followerCount > 0 ? 100 : 0);

 // Trust score calculation (simplified)
 const trustScore = Math.min(100, followerCount * 0.1 + retentionRate * 0.5 + 50);

 await prisma.sellerTier.upsert({
  where: { storeId },
  update: {
   tierLevel,
   subscriberCount: followerCount,
   trustScore: parseFloat(trustScore.toFixed(2)),
   retentionRate: parseFloat(retentionRate.toFixed(2)),
   lastUpdated: new Date(),
   features: JSON.stringify(features),
  },
  create: {
   storeId,
   tierLevel,
   subscriberCount: followerCount,
   trustScore: parseFloat(trustScore.toFixed(2)),
   retentionRate: parseFloat(retentionRate.toFixed(2)),
   features: JSON.stringify(features),
  },
 });
}

/**
 * Get seller tier information
 */
export const getSellerTier = async (req: AuthRequest, res: Response): Promise<void> => {
 try {
  const { storeId } = req.params;

  if (!storeId) {
   res.status(400).json({ error: 'Store ID is required' });
   return;
  }

  const tier = await prisma.sellerTier.findUnique({
   where: { storeId },
  });

  if (!tier) {
   // Return default tier
   res.json({
    tierLevel: 'TIER_1',
    subscriberCount: 0,
    trustScore: 0,
    retentionRate: 100,
    features: ['basic_store', 'standard_support'],
    nextTier: {
     name: 'TIER_2',
     required: 100,
     benefits: ['Premium branding tools'],
    },
   });
   return;
  }

  // Determine next tier info
  let nextTier = null;
  if (tier.subscriberCount < 100) {
   nextTier = { name: 'TIER_2', required: 100, benefits: ['Premium branding tools'] };
  } else if (tier.subscriberCount < 500) {
   nextTier = { name: 'TIER_3', required: 500, benefits: ['Advanced marketing insights'] };
  } else if (tier.subscriberCount < 1000) {
   nextTier = { name: 'TIER_4', required: 1000, benefits: ['Priority placement', 'API access'] };
  }

  res.json({
   ...tier,
   features: tier.features ? JSON.parse(tier.features) : [],
   nextTier,
  });
 } catch (error: any) {
  console.error('Error in getSellerTier:', error);
  res.status(500).json({ error: 'Failed to get seller tier' });
 }
};
