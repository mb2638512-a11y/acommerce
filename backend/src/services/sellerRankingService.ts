import prisma from '../utils/prisma';

/**
 * Seller Ranking Service
 * 
 * This service handles the top seller identification algorithm based on:
 * - Subscriber/follower count
 * - Trust score
 * - Retention rate
 * - Sales volume
 * - Ratings
 */

// Tier thresholds
const TIER_THRESHOLDS = {
 TIER_1: 0,
 TIER_2: 100,
 TIER_3: 500,
 TIER_4: 1000,
};

// Tier features
const TIER_FEATURES: Record<string, string[]> = {
 TIER_1: ['basic_store', 'standard_support', 'email_support'],
 TIER_2: ['basic_store', 'standard_support', 'email_support', 'premium_branding', 'custom_banner', 'logo_upload'],
 TIER_3: ['basic_store', 'standard_support', 'email_support', 'premium_branding', 'custom_banner', 'logo_upload', 'marketing_insights', 'analytics_dashboard', 'promo_tools'],
 TIER_4: ['basic_store', 'standard_support', 'email_support', 'premium_branding', 'custom_banner', 'logo_upload', 'marketing_insights', 'analytics_dashboard', 'promo_tools', 'priority_placement', 'api_access', 'dedicated_support', 'featured_listings'],
};

/**
 * Calculate trust score for a seller
 */
export async function calculateTrustScore(storeId: string): Promise<number> {
 try {
  // Get follower data
  const followerCount = await prisma.sellerFollower.count({
   where: { storeId },
  });

  // Get seller tier for retention rate
  const sellerTier = await prisma.sellerTier.findUnique({
   where: { storeId },
  });

  const retentionRate = sellerTier?.retentionRate || 100;

  // Get order data for trust calculation
  const store = await prisma.store.findUnique({
   where: { id: storeId },
   include: {
    orders: {
     where: {
      status: { in: ['DELIVERED', 'SHIPPED'] },
     },
     select: { id: true, total: true },
    },
    products: {
     include: {
      reviews: {
       select: { rating: true },
      },
     },
    },
   },
  });

  if (!store) return 0;

  // Calculate order completion rate
  const completedOrders = store.orders.length;
  const totalAmount = store.orders.reduce((sum, o) => sum + o.total, 0);

  // Calculate average rating from product reviews
  const allReviews = store.products.flatMap(p => p.reviews);
  const avgRating = allReviews.length > 0
   ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
   : 0;

  // Trust score components:
  // 1. Follower factor (max 20 points)
  const followerFactor = Math.min(20, followerCount * 0.1);

  // 2. Retention factor (max 30 points)
  const retentionFactor = (retentionRate / 100) * 30;

  // 3. Order completion factor (max 25 points)
  const orderFactor = Math.min(25, completedOrders * 0.5);

  // 4. Sales volume factor (max 15 points)
  const salesFactor = Math.min(15, Math.log10(Math.max(totalAmount, 1)) * 3);

  // 5. Rating factor (max 10 points)
  const ratingFactor = (avgRating / 5) * 10;

  const trustScore = followerFactor + retentionFactor + orderFactor + salesFactor + ratingFactor;

  return parseFloat(Math.min(100, trustScore).toFixed(2));
 } catch (error) {
  console.error('Error calculating trust score:', error);
  return 0;
 }
}

/**
 * Determine tier level based on subscriber count
 */
export function getTierLevel(subscriberCount: number): string {
 if (subscriberCount >= TIER_THRESHOLDS.TIER_4) return 'TIER_4';
 if (subscriberCount >= TIER_THRESHOLDS.TIER_3) return 'TIER_3';
 if (subscriberCount >= TIER_THRESHOLDS.TIER_2) return 'TIER_2';
 return 'TIER_1';
}

/**
 * Get tier features
 */
export function getTierFeatures(tierLevel: string): string[] {
 return TIER_FEATURES[tierLevel] || TIER_FEATURES.TIER_1;
}

/**
 * Update seller tier based on current metrics
 */
export async function updateSellerTier(storeId: string): Promise<void> {
 try {
  const followerCount = await prisma.sellerFollower.count({
   where: { storeId },
  });

  const tierLevel = getTierLevel(followerCount);
  const features = getTierFeatures(tierLevel);
  const trustScore = await calculateTrustScore(storeId);

  // Calculate retention rate
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

  await prisma.sellerTier.upsert({
   where: { storeId },
   update: {
    tierLevel,
    subscriberCount: followerCount,
    trustScore,
    retentionRate: parseFloat(retentionRate.toFixed(2)),
    lastUpdated: new Date(),
    features: JSON.stringify(features),
   },
   create: {
    storeId,
    tierLevel,
    subscriberCount: followerCount,
    trustScore,
    retentionRate: parseFloat(retentionRate.toFixed(2)),
    features: JSON.stringify(features),
   },
  });
 } catch (error) {
  console.error('Error updating seller tier:', error);
 }
}

/**
 * Calculate overall ranking score for a seller
 */
export async function calculateRankingScore(storeId: string): Promise<{
 score: number;
 followerCount: number;
 trustScore: number;
 retentionRate: number;
 salesVolume: number;
 rating: number;
}> {
 try {
  const sellerTier = await prisma.sellerTier.findUnique({
   where: { storeId },
  });

  const followerCount = sellerTier?.subscriberCount || 0;
  const trustScore = sellerTier?.trustScore || 0;
  const retentionRate = sellerTier?.retentionRate || 100;

  // Get sales volume
  const orders = await prisma.order.findMany({
   where: {
    storeId,
    status: { in: ['DELIVERED', 'SHIPPED'] },
   },
   select: { total: true },
  });

  const salesVolume = orders.reduce((sum, o) => sum + o.total, 0);

  // Get average rating
  const products = await prisma.product.findMany({
   where: { storeId },
   include: {
    reviews: { select: { rating: true } },
   },
  });

  const allReviews = products.flatMap(p => p.reviews);
  const rating = allReviews.length > 0
   ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
   : 0;

  // Calculate overall score (weighted)
  // Weights: trustScore 30%, followers 25%, retention 20%, sales 15%, rating 10%
  const score =
   (trustScore * 0.30) +
   (Math.min(100, followerCount * 0.5) * 0.25) +
   (retentionRate * 0.20) +
   (Math.min(100, Math.log10(Math.max(salesVolume, 1)) * 10) * 0.15) +
   (rating * 20 * 0.10);

  return {
   score: parseFloat(Math.min(100, score).toFixed(2)),
   followerCount,
   trustScore,
   retentionRate,
   salesVolume,
   rating: parseFloat(rating.toFixed(2)),
  };
 } catch (error) {
  console.error('Error calculating ranking score:', error);
  return {
   score: 0,
   followerCount: 0,
   trustScore: 0,
   retentionRate: 100,
   salesVolume: 0,
   rating: 0,
  };
 }
}

/**
 * Update top seller rankings
 * This should be called periodically (e.g., daily via cron)
 */
export async function updateTopSellers(limit: number = 100): Promise<void> {
 try {
  // Get all stores with at least one follower or order
  const stores = await prisma.store.findMany({
   select: { id: true },
   include: {
    followers: { select: { id: true } },
    orders: {
     where: { status: { in: ['DELIVERED', 'SHIPPED'] } },
     select: { total: true },
    },
    products: {
     include: {
      reviews: { select: { rating: true } },
     },
    },
   },
  });

  // Calculate scores for each store
  const storeScores = await Promise.all(
   stores.map(async (store) => {
    const rankingData = await calculateRankingScore(store.id);
    return {
     storeId: store.id,
     ...rankingData,
    };
   })
  );

  // Sort by score descending
  storeScores.sort((a, b) => b.score - a.score);

  // Update top sellers
  const topSellers = storeScores.slice(0, limit);

  // Use transaction to update all top sellers
  await prisma.$transaction(async (tx) => {
   // Clear existing top sellers
   await tx.topSeller.deleteMany({});

   // Insert new top sellers
   for (let i = 0; i < topSellers.length; i++) {
    const seller = topSellers[i];
    await tx.topSeller.create({
     data: {
      storeId: seller.storeId,
      rank: i + 1,
      trustScore: seller.trustScore,
      followerCount: seller.followerCount,
      retentionRate: seller.retentionRate,
      salesVolume: seller.salesVolume,
      rating: seller.rating,
      updatedAt: new Date(),
     },
    });
   }
  });

  console.log(`Updated top sellers: ${topSellers.length} stores ranked`);
 } catch (error) {
  console.error('Error updating top sellers:', error);
 }
}

/**
 * Get top sellers
 */
export async function getTopSellers(limit: number = 10): Promise<Array<{
 rank: number;
 storeId: string;
 storeName: string;
 storeSlug: string;
 trustScore: number;
 followerCount: number;
 retentionRate: number;
 salesVolume: number;
 rating: number;
}>> {
 try {
  const topSellers = await prisma.topSeller.findMany({
   take: limit,
   orderBy: { rank: 'asc' },
   include: {
    store: {
     select: {
      name: true,
      slug: true,
     },
    },
   },
  });

  return topSellers.map(ts => ({
   rank: ts.rank,
   storeId: ts.storeId,
   storeName: ts.store.name,
   storeSlug: ts.store.slug,
   trustScore: ts.trustScore,
   followerCount: ts.followerCount,
   retentionRate: ts.retentionRate,
   salesVolume: ts.salesVolume,
   rating: ts.rating,
  }));
 } catch (error) {
  console.error('Error getting top sellers:', error);
  return [];
 }
}

/**
 * Check if a seller has a specific feature based on their tier
 */
export async function hasFeature(storeId: string, feature: string): Promise<boolean> {
 try {
  const sellerTier = await prisma.sellerTier.findUnique({
   where: { storeId },
  });

  if (!sellerTier) {
   // Default tier 1 doesn't have premium features
   return TIER_FEATURES.TIER_1.includes(feature);
  }

  const features = sellerTier.features
   ? JSON.parse(sellerTier.features)
   : TIER_FEATURES[sellerTier.tierLevel] || TIER_FEATURES.TIER_1;

  return features.includes(feature);
 } catch (error) {
  console.error('Error checking feature:', error);
  return false;
 }
}

/**
 * Get seller's current tier info with next tier info
 */
export async function getTierInfo(storeId: string): Promise<{
 currentTier: string;
 subscriberCount: number;
 trustScore: number;
 retentionRate: number;
 features: string[];
 nextTier: {
  name: string;
  required: number;
  benefits: string[];
 } | null;
}> {
 const sellerTier = await prisma.sellerTier.findUnique({
  where: { storeId },
 });

 const tierLevel = sellerTier?.tierLevel || 'TIER_1';
 const subscriberCount = sellerTier?.subscriberCount || 0;
 const trustScore = sellerTier?.trustScore || 0;
 const retentionRate = sellerTier?.retentionRate || 100;
 const features = sellerTier?.features
  ? JSON.parse(sellerTier.features)
  : TIER_FEATURES[tierLevel];

 // Determine next tier
 let nextTier = null;
 if (subscriberCount < 100) {
  nextTier = { name: 'TIER_2', required: 100, benefits: TIER_FEATURES.TIER_2 };
 } else if (subscriberCount < 500) {
  nextTier = { name: 'TIER_3', required: 500, benefits: TIER_FEATURES.TIER_3 };
 } else if (subscriberCount < 1000) {
  nextTier = { name: 'TIER_4', required: 1000, benefits: TIER_FEATURES.TIER_4 };
 }

 return {
  currentTier: tierLevel,
  subscriberCount,
  trustScore,
  retentionRate,
  features,
  nextTier,
 };
}

/**
 * Get products from top sellers (for auto-promotion)
 */
export async function getTopSellerProducts(limit: number = 20): Promise<Array<{
 product: any;
 sellerRank: number;
 trustScore: number;
}>> {
 try {
  const topSellers = await prisma.topSeller.findMany({
   take: 10,
   orderBy: { rank: 'asc' },
   include: {
    store: {
     include: {
      products: {
       where: { status: 'ACTIVE' },
       take: 5,
       orderBy: { createdAt: 'desc' },
      },
     },
    },
   },
  });

  const results: Array<{
   product: any;
   sellerRank: number;
   trustScore: number;
  }> = [];

  for (const seller of topSellers) {
   for (const product of seller.store.products) {
    results.push({
     product,
     sellerRank: seller.rank,
     trustScore: seller.trustScore,
    });
   }
  }

  return results.slice(0, limit);
 } catch (error) {
  console.error('Error getting top seller products:', error);
  return [];
 }
}
