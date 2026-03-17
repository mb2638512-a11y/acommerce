import express from 'express';
import {
 generateContent,
 analyzeSentiment,
 analyzeBatchSentiment,
 analyzeProductReviews,
 translateContent,
 translateBatchContent,
 translateProductContent,
 getPersonalizedRecommendations,
 getRelatedProducts,
 segmentCustomers,
 getSegmentDetails,
 // Agent endpoints
 optimizeProductSEO,
 generateProductKeywords,
 analyzeInventory,
 predictRestock,
 generateProductListing,
 generateProductTitle,
 generateProductDescription,
 analyzePricing,
 suggestProductPrice,
 optimizeStoreDiscounts
} from '../controllers/aiController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// ==================== GENERAL AI ====================

// Protected route to prevent abuse
router.post('/generate', authenticate, generateContent);

// ==================== SENTIMENT ANALYSIS ====================

// Analyze single piece of content
router.post('/sentiment', authenticate, analyzeSentiment);

// Analyze multiple items at once
router.post('/sentiment/batch', authenticate, analyzeBatchSentiment);

// Analyze all reviews for a product
router.get('/sentiment/product/:productId', authenticate, analyzeProductReviews);

// ==================== TRANSLATION ====================

// Translate single content
router.post('/translate', authenticate, translateContent);

// Translate multiple items at once
router.post('/translate/batch', authenticate, translateBatchContent);

// Translate product content (name, description, category)
router.post('/translate/product/:productId', authenticate, translateProductContent);

// ==================== RECOMMENDATIONS ====================

// Get personalized recommendations
router.post('/recommendations', authenticate, getPersonalizedRecommendations);

// Get related products for a specific product
router.get('/recommendations/related/:productId', authenticate, getRelatedProducts);

// ==================== AUDIENCE SEGMENTATION ====================

// Segment customers in a store
router.post('/segmentation', authenticate, segmentCustomers);

// Get details of a specific segment
router.get('/segmentation/:storeId', authenticate, getSegmentDetails);

// ==================== AI AUTONOMOUS AGENTS ====================

// SEO Agent endpoints
router.post('/agent/seo/:productId', authenticate, optimizeProductSEO);
router.post('/agent/seo/:productId/keywords', authenticate, generateProductKeywords);

// Inventory Agent endpoints
router.get('/agent/inventory/:storeId', authenticate, analyzeInventory);
router.get('/agent/inventory/:storeId/predict', authenticate, predictRestock);

// Listing Agent endpoints
router.post('/agent/listing/:productId', authenticate, generateProductListing);
router.post('/agent/listing/:productId/title', authenticate, generateProductTitle);
router.post('/agent/listing/:productId/description', authenticate, generateProductDescription);

// Pricing Agent endpoints
router.post('/agent/pricing/:productId', authenticate, analyzePricing);
router.post('/agent/pricing/:productId/suggest', authenticate, suggestProductPrice);
router.post('/agent/pricing/store/:storeId/optimize', authenticate, optimizeStoreDiscounts);

export default router;
