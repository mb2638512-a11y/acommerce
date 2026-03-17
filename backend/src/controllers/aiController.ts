import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { callOpenRouter } from '../services/openRouterService';
import { aiAgentService } from '../services/aiAgentService';

const orKey = process.env.OPENROUTER_API_KEY || '';

// ==================== SCHEMAS ====================

const generateSchema = z.object({
    prompt: z.string().trim().min(1).max(4000),
    model: z.string().trim().min(1).max(120).optional(),
    type: z.enum(['text', 'json']).optional()
});

// Sentiment Analysis Schema
const sentimentSchema = z.object({
    content: z.string().trim().min(1).max(5000),
    context: z.enum(['review', 'feedback', 'support_ticket', 'general']).optional()
});

// Batch Sentiment Analysis Schema
const batchSentimentSchema = z.object({
    items: z.array(z.object({
        id: z.string(),
        content: z.string().trim().min(1).max(5000)
    })).min(1).max(100)
});

// Translation Schema
const translationSchema = z.object({
    text: z.string().trim().min(1).max(10000),
    targetLanguage: z.string().trim().min(2).max(50),
    sourceLanguage: z.string().trim().min(2).max(50).optional()
});

// Batch Translation Schema
const batchTranslationSchema = z.object({
    items: z.array(z.object({
        id: z.string(),
        text: z.string().trim().min(1).max(10000)
    })).min(1).max(50),
    targetLanguage: z.string().trim().min(2).max(50)
});

// Recommendations Schema
const recommendationsSchema = z.object({
    customerId: z.string().uuid().optional(),
    viewedProducts: z.array(z.string()).optional(),
    purchasedProducts: z.array(z.string()).optional(),
    categories: z.array(z.string()).optional(),
    limit: z.number().min(1).max(20).optional()
});

// Customer Segmentation Schema
const segmentationSchema = z.object({
    storeId: z.string().uuid(),
    segmentTypes: z.array(z.enum([
        'high_value',
        'at_risk',
        'new_customers',
        'loyal',
        'occasional',
        'big_spenders',
        'bargain_hunters',
        'dormant'
    ])).optional(),
    minOrderValue: z.number().optional(),
    minOrderCount: z.number().optional()
});

// ==================== EXISTING ENDPOINT ====================

export const generateContent = async (req: Request, res: Response) => {
    try {
        const { prompt, model, type = 'text' } = generateSchema.parse(req.body);

        if (!orKey) {
            return res.status(500).json({ error: 'OpenRouter API key not configured' });
        }

        // Use specified model or default to meta-llama
        const selectedModel = model || 'meta-llama/llama-3.1-8b-instruct';

        // OpenRouter Path
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${orKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": selectedModel,
                "messages": [{ "role": "user", "content": prompt }],
                "response_format": type === 'json' ? { "type": "json_object" } : undefined
            })
        });
        const data = await response.json();

        if (data.error) {
            return res.status(500).json({ error: data.error.message });
        }

        return res.json({ text: data.choices[0].message.content });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Invalid AI request payload' });
        }
        console.error("AI Generation Error:", error);
        res.status(500).json({ error: 'Failed to generate content' });
    }
};

// ==================== SENTIMENT ANALYSIS ====================

export const analyzeSentiment = async (req: Request, res: Response) => {
    try {
        const { content, context = 'general' } = sentimentSchema.parse(req.body);

        const prompt = `
Analyze the sentiment of the following ${context}. Provide a detailed analysis.

Content: "${content}"

Return a JSON object with this exact structure:
{
  "sentiment": "positive" | "neutral" | "negative",
  "score": <number between -1 and 1>,
  "summary": "<short 1-sentence summary of the sentiment>",
  "emotions": ["<list of detected emotions>"],
  "key_phrases": ["<important phrases detected>"],
  "suggestion": "<optional suggestion for business response if negative>"
}
`.trim();

        const result = await callOpenRouter(prompt, 'sentiment', {
            responseFormat: { type: 'json_object' },
            temperature: 0.3,
            maxTokens: 500,
            useCache: true
        });

        const parsed = JSON.parse(result);
        res.json(parsed);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Invalid sentiment analysis request' });
        }
        console.error('Sentiment Analysis Error:', error);
        res.status(500).json({ error: 'Failed to analyze sentiment' });
    }
};

export const analyzeBatchSentiment = async (req: Request, res: Response) => {
    try {
        const { items } = batchSentimentSchema.parse(req.body);

        const results = await Promise.allSettled(
            items.map(async (item) => {
                const prompt = `
Analyze the sentiment of this customer feedback.

Content: "${item.content}"

Return JSON:
{
  "sentiment": "positive" | "neutral" | "negative",
  "score": <number between -1 and 1>,
  "summary": "<short summary>"
}
`.trim();

                const result = await callOpenRouter(prompt, 'sentiment', {
                    responseFormat: { type: 'json_object' },
                    temperature: 0.3,
                    maxTokens: 200
                });

                return {
                    id: item.id,
                    ...JSON.parse(result)
                };
            })
        );

        const successful = results
            .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
            .map(r => r.value);

        const failed = results
            .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
            .map((_, i) => items[i].id);

        res.json({
            results: successful,
            summary: {
                total: items.length,
                successful: successful.length,
                failed: failed.length,
                positive: successful.filter(r => r.sentiment === 'positive').length,
                neutral: successful.filter(r => r.sentiment === 'neutral').length,
                negative: successful.filter(r => r.sentiment === 'negative').length
            },
            failedIds: failed
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Invalid batch sentiment request' });
        }
        console.error('Batch Sentiment Error:', error);
        res.status(500).json({ error: 'Failed to analyze batch sentiment' });
    }
};

// Analyze reviews for a product
export const analyzeProductReviews = async (req: Request, res: Response) => {
    try {
        const { productId } = req.params;
        const storeId = req.query.storeId as string;

        if (!storeId) {
            return res.status(400).json({ error: 'storeId is required' });
        }

        const reviews = await prisma.review.findMany({
            where: {
                product: {
                    id: productId,
                    storeId
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        if (reviews.length === 0) {
            return res.json({
                message: 'No reviews found for this product',
                summary: { positive: 0, neutral: 0, negative: 0, total: 0 },
                reviews: []
            });
        }

        const reviewContents = reviews.map(r => ({
            id: r.id,
            content: `Rating: ${r.rating}/5. Review: ${r.comment || 'No comment'}`
        }));

        const prompt = `
Analyze the sentiment of these ${reviews.length} customer reviews for a product.

Reviews:
${reviewContents.map(r => `- ${r.content}`).join('\n')}

Return a JSON object with:
{
  "summary": {
    "positive": <count>,
    "neutral": <count>,
    "negative": <count>,
    "averageRating": <number>,
    "overallSentiment": "positive" | "neutral" | "negative"
  },
  "keyThemes": ["<list of common themes>"],
  "topPositivePoints": ["<what customers like>"],
  "topNegativePoints": ["<what customers dislike>"],
  "recommendation": "<business recommendation>"
}
`.trim();

        const result = await callOpenRouter(prompt, 'sentiment', {
            responseFormat: { type: 'json_object' },
            temperature: 0.3,
            maxTokens: 800
        });

        const parsed = JSON.parse(result);

        res.json({
            productId,
            reviewCount: reviews.length,
            ...parsed,
            reviews: reviews.map(r => ({
                id: r.id,
                rating: r.rating,
                comment: r.comment,
                customerName: r.customerName,
                createdAt: r.createdAt
            }))
        });
    } catch (error) {
        console.error('Product Reviews Analysis Error:', error);
        res.status(500).json({ error: 'Failed to analyze product reviews' });
    }
};

// ==================== CONTENT TRANSLATION ====================

export const translateContent = async (req: Request, res: Response) => {
    try {
        const { text, targetLanguage, sourceLanguage } = translationSchema.parse(req.body);

        const prompt = `
Translate the following text from ${sourceLanguage || 'auto-detect'} to ${targetLanguage}.

Original Text:
${text}

Provide only the translated text as output, without any explanations or formatting.
`.trim();

        const result = await callOpenRouter(prompt, 'translation', {
            temperature: 0.3,
            maxTokens: text.length * 2,
            useCache: true
        });

        res.json({
            originalText: text,
            translatedText: result.trim(),
            sourceLanguage: sourceLanguage || 'auto-detected',
            targetLanguage
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Invalid translation request' });
        }
        console.error('Translation Error:', error);
        res.status(500).json({ error: 'Failed to translate content' });
    }
};

export const translateBatchContent = async (req: Request, res: Response) => {
    try {
        const { items, targetLanguage } = batchTranslationSchema.parse(req.body);

        const results = await Promise.allSettled(
            items.map(async (item) => {
                const prompt = `
Translate to ${targetLanguage}:
${item.text}
`.trim();

                const result = await callOpenRouter(prompt, 'translation', {
                    temperature: 0.3,
                    maxTokens: item.text.length * 2
                });

                return {
                    id: item.id,
                    translatedText: result.trim()
                };
            })
        );

        const successful = results
            .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
            .map(r => r.value);

        const failed = results
            .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
            .map((_, i) => items[i].id);

        res.json({
            targetLanguage,
            results: successful,
            summary: {
                total: items.length,
                successful: successful.length,
                failed: failed.length
            },
            failedIds: failed
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Invalid batch translation request' });
        }
        console.error('Batch Translation Error:', error);
        res.status(500).json({ error: 'Failed to translate batch content' });
    }
};

// Translate product content
export const translateProductContent = async (req: Request, res: Response) => {
    try {
        const { productId } = req.params;
        const { targetLanguage, sourceLanguage } = translationSchema.parse(req.body);

        const product = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const prompt = `
Translate the following product information from ${sourceLanguage || 'English'} to ${targetLanguage}.

Product Name: ${product.name}
Description: ${product.description || 'N/A'}
Category: ${product.category || 'N/A'}

Return JSON:
{
  "translatedName": "<translated name>",
  "translatedDescription": "<translated description>",
  "translatedCategory": "<translated category>"
}
`.trim();

        const result = await callOpenRouter(prompt, 'translation', {
            responseFormat: { type: 'json_object' },
            temperature: 0.3,
            maxTokens: 1000
        });

        const parsed = JSON.parse(result);

        res.json({
            productId,
            original: {
                name: product.name,
                description: product.description,
                category: product.category
            },
            translated: parsed,
            targetLanguage
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Invalid product translation request' });
        }
        console.error('Product Translation Error:', error);
        res.status(500).json({ error: 'Failed to translate product content' });
    }
};

// ==================== PERSONALIZED RECOMMENDATIONS ====================

export const getPersonalizedRecommendations = async (req: Request, res: Response) => {
    try {
        const {
            customerId,
            viewedProducts,
            purchasedProducts,
            categories,
            limit = 10
        } = recommendationsSchema.parse(req.body);

        let productContext = '';
        let customerContext = '';

        // Get customer context if customerId provided
        if (customerId) {
            const customer = await prisma.customer.findUnique({
                where: { id: customerId }
            });

            if (customer) {
                customerContext = `
Customer Profile:
- Total Spent: $${customer.totalSpent.toFixed(2)}
- Orders Count: ${customer.ordersCount}
- Last Order: ${customer.lastOrderDate?.toISOString() || 'N/A'}
- Tags: ${typeof customer.tags === 'string' ? customer.tags : 'None'}
`.trim();
            }
        }

        // Get product details if product IDs provided
        if (viewedProducts?.length || purchasedProducts?.length) {
            const productIds = [...(viewedProducts || []), ...(purchasedProducts || [])];
            const products = await prisma.product.findMany({
                where: { id: { in: productIds } },
                select: { id: true, name: true, category: true, price: true }
            });

            const viewed = products.filter(p => viewedProducts?.includes(p.id));
            const purchased = products.filter(p => purchasedProducts?.includes(p.id));

            productContext = `
Viewed Products: ${viewed.map(p => p.name).join(', ') || 'None'}
Purchased Products: ${purchased.map(p => p.name).join(', ') || 'None'}
Categories Interested: ${[...new Set(products.map(p => p.category).filter(Boolean))].join(', ') || 'None'}
`.trim();
        }

        const prompt = `
Based on the following customer behavior data, suggest ${limit} products they might be interested in.

${customerContext}

${productContext}

${categories ? `Preferred Categories: ${categories.join(', ')}` : ''}

Return a JSON object:
{
  "recommendations": [
    {
      "reason": "<why this product is recommended>",
      "confidence": <0-1>,
      "productType": "<complement|upgrade|similar|accessory>"
    }
  ],
  "insight": "<brief explanation of the recommendation strategy>"
}
`.trim();

        const result = await callOpenRouter(prompt, 'recommendations', {
            responseFormat: { type: 'json_object' },
            temperature: 0.7,
            maxTokens: 1000
        });

        const parsed = JSON.parse(result);

        // If we have product IDs, fetch actual products
        let recommendedProducts: any[] = [];
        if (categories?.length) {
            recommendedProducts = await prisma.product.findMany({
                where: {
                    category: { in: categories },
                    status: 'ACTIVE'
                },
                take: limit,
                orderBy: { createdAt: 'desc' }
            });
        }

        res.json({
            customerId,
            recommendations: parsed.recommendations || [],
            recommendedProducts,
            insight: parsed.insight
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Invalid recommendations request' });
        }
        console.error('Recommendations Error:', error);
        res.status(500).json({ error: 'Failed to get recommendations' });
    }
};

// Get AI-powered related products for a specific product
export const getRelatedProducts = async (req: Request, res: Response) => {
    try {
        const { productId } = req.params;
        const limit = Math.min(parseInt(req.query.limit as string) || 8, 20);

        const product = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Get products in same category
        const sameCategory = await prisma.product.findMany({
            where: {
                id: { not: productId },
                category: product.category,
                status: 'ACTIVE'
            },
            take: limit,
            orderBy: { createdAt: 'desc' }
        });

        const prompt = `
For a product named "${product.name}" in category "${product.category || 'General'}", 
with description "${product.description?.substring(0, 200) || 'N/A'}" and price $${product.price},
suggest what types of products would make good:
1. Cross-sells (products bought together)
2. Up-sells (premium alternatives)
3. Related items (similar products)

Return JSON:
{
  "crossSells": ["<product type suggestions>"],
  "upSells": ["<premium product suggestions>"],
  "relatedItems": ["<similar product suggestions>"]
}
`.trim();

        const result = await callOpenRouter(prompt, 'recommendations', {
            responseFormat: { type: 'json_object' },
            temperature: 0.7,
            maxTokens: 500
        });

        const parsed = JSON.parse(result);

        res.json({
            sourceProduct: {
                id: product.id,
                name: product.name,
                category: product.category,
                price: product.price
            },
            aiSuggestions: parsed,
            sameCategoryProducts: sameCategory.map(p => ({
                id: p.id,
                name: p.name,
                price: p.price,
                image: p.images[0] || null
            }))
        });
    } catch (error) {
        console.error('Related Products Error:', error);
        res.status(500).json({ error: 'Failed to get related products' });
    }
};

// ==================== AUDIENCE SEGMENTATION ====================

export const segmentCustomers = async (req: Request, res: Response) => {
    try {
        const { storeId, segmentTypes, minOrderValue, minOrderCount } = segmentationSchema.parse(req.body);

        // Get customers with their order history
        const customers = await prisma.customer.findMany({
            where: { storeId },
            include: {
                orders: {
                    select: {
                        id: true,
                        total: true,
                        date: true,
                        status: true
                    }
                }
            }
        });

        if (customers.length === 0) {
            return res.json({
                storeId,
                segments: {},
                summary: { totalCustomers: 0 }
            });
        }

        // Prepare customer data for AI analysis
        const customerData = customers.map(c => ({
            id: c.id,
            email: c.email,
            name: c.name,
            totalSpent: c.totalSpent,
            ordersCount: c.ordersCount,
            lastOrderDate: c.lastOrderDate?.toISOString(),
            createdAt: c.createdAt.toISOString()
        }));

        const segmentTypesToAnalyze = segmentTypes || [
            'high_value', 'at_risk', 'new_customers', 'loyal',
            'occasional', 'big_spenders', 'bargain_hunters', 'dormant'
        ];

        const prompt = `
Analyze these ${customers.length} customers and segment them based on their behavior.

Customer Data:
${JSON.stringify(customerData, null, 2)}

Segment Definitions:
- high_value: High total spend, frequent orders
- at_risk: Haven't ordered in 90+ days
- new_customers: First order within last 30 days
- loyal: 5+ orders, consistent purchasing
- occasional: 2-4 orders, irregular
- big_spenders: Single large orders (>$200)
- bargain_hunters: Multiple small orders, discount seekers
- dormant: No activity in 180+ days

Return JSON:
{
  "segments": {
    "high_value": { "customerIds": ["<ids>"], "count": <number> },
    "at_risk": { "customerIds": ["<ids>"], "count": <number> },
    "new_customers": { "customerIds": ["<ids>"], "count": <number> },
    "loyal": { "customerIds": ["<ids>"], "count": <number> },
    "occasional": { "customerIds": ["<ids>"], "count": <number> },
    "big_spenders": { "customerIds": ["<ids>"], "count": <number> },
    "bargain_hunters": { "customerIds": ["<ids>"], "count": <number> },
    "dormant": { "customerIds": ["<ids>"], "count": <number> }
  },
  "insights": {
    "retentionRisk": "<percentage of at-risk customers>",
    "growthPotential": "<assessment>",
    "recommendations": ["<actionable recommendations>"]
  }
}
`.trim();

        const result = await callOpenRouter(prompt, 'segmentation', {
            responseFormat: { type: 'json_object' },
            temperature: 0.3,
            maxTokens: 2000
        });

        const parsed = JSON.parse(result);

        res.json({
            storeId,
            totalCustomers: customers.length,
            segments: parsed.segments,
            insights: parsed.insights
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Invalid segmentation request' });
        }
        console.error('Segmentation Error:', error);
        res.status(500).json({ error: 'Failed to segment customers' });
    }
};

// Get specific segment details
export const getSegmentDetails = async (req: Request, res: Response) => {
    try {
        const { storeId } = req.params;
        const { segment, minValue, minOrders } = req.query;

        if (!segment) {
            return res.status(400).json({ error: 'segment parameter is required' });
        }

        // Build filter based on segment type
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

        let whereClause: any = { storeId };

        switch (segment) {
            case 'high_value':
                whereClause = {
                    ...whereClause,
                    totalSpent: { gte: minValue ? parseFloat(minValue as string) : 200 },
                    ordersCount: { gte: minOrders ? parseInt(minOrders as string) : 3 }
                };
                break;
            case 'at_risk':
                whereClause = {
                    ...whereClause,
                    lastOrderDate: { lte: ninetyDaysAgo, not: null }
                };
                break;
            case 'new_customers':
                whereClause = {
                    ...whereClause,
                    createdAt: { gte: thirtyDaysAgo }
                };
                break;
            case 'loyal':
                whereClause = {
                    ...whereClause,
                    ordersCount: { gte: 5 }
                };
                break;
            case 'occasional':
                whereClause = {
                    ...whereClause,
                    ordersCount: { gte: 2, lte: 4 }
                };
                break;
            case 'big_spenders':
                whereClause = {
                    ...whereClause,
                    totalSpent: { gte: minValue ? parseFloat(minValue as string) : 200 }
                };
                break;
            case 'dormant':
                whereClause = {
                    ...whereClause,
                    OR: [
                        { lastOrderDate: { lte: sixMonthsAgo } },
                        { lastOrderDate: null, createdAt: { lte: sixMonthsAgo } }
                    ]
                };
                break;
            default:
                return res.status(400).json({ error: 'Invalid segment type' });
        }

        const customers = await prisma.customer.findMany({
            where: whereClause,
            include: {
                orders: {
                    take: 5,
                    orderBy: { date: 'desc' },
                    select: { id: true, total: true, date: true, status: true }
                }
            },
            orderBy: { totalSpent: 'desc' }
        });

        res.json({
            storeId,
            segment: segment,
            count: customers.length,
            customers: customers.map(c => ({
                id: c.id,
                name: c.name,
                email: c.email,
                totalSpent: c.totalSpent,
                ordersCount: c.ordersCount,
                lastOrderDate: c.lastOrderDate,
                recentOrders: c.orders
            }))
        });
    } catch (error) {
        console.error('Segment Details Error:', error);
        res.status(500).json({ error: 'Failed to get segment details' });
    }
};

// ============================================================================
// AI AUTONOMOUS AGENTS
// ============================================================================

// ==================== SEO AGENT ====================

// Auto-optimize product SEO
export const optimizeProductSEO = async (req: Request, res: Response) => {
    try {
        const { productId } = req.params;

        if (!orKey) {
            return res.status(500).json({ error: 'OpenRouter API key not configured' });
        }

        const result = await aiAgentService.seo.autoOptimizeSEO(productId);

        res.json({
            success: true,
            productId,
            seo: result
        });
    } catch (error) {
        console.error('SEO Agent Error:', error);
        res.status(500).json({ error: 'Failed to optimize product SEO' });
    }
};

// Generate SEO keywords for a product
export const generateProductKeywords = async (req: Request, res: Response) => {
    try {
        const { productId } = req.params;

        if (!orKey) {
            return res.status(500).json({ error: 'OpenRouter API key not configured' });
        }

        const keywords = await aiAgentService.seo.generateKeywords(productId);

        res.json({
            success: true,
            productId,
            keywords
        });
    } catch (error) {
        console.error('Keyword Generation Error:', error);
        res.status(500).json({ error: 'Failed to generate keywords' });
    }
};

// ==================== INVENTORY AGENT ====================

// Analyze stock levels for a store
export const analyzeInventory = async (req: Request, res: Response) => {
    try {
        const { storeId } = req.params;

        const alerts = await aiAgentService.inventory.analyzeStockLevels(storeId);

        res.json({
            success: true,
            storeId,
            alerts,
            summary: {
                total: alerts.length,
                high: alerts.filter(a => a.urgency === 'HIGH').length,
                medium: alerts.filter(a => a.urgency === 'MEDIUM').length,
                low: alerts.filter(a => a.urgency === 'LOW').length
            }
        });
    } catch (error) {
        console.error('Inventory Analysis Error:', error);
        res.status(500).json({ error: 'Failed to analyze inventory' });
    }
};

// Predict restock needs
export const predictRestock = async (req: Request, res: Response) => {
    try {
        const { storeId } = req.params;

        const predictions = await aiAgentService.inventory.predictRestock(storeId);

        res.json({
            success: true,
            storeId,
            predictions,
            summary: {
                total: predictions.length,
                urgent: predictions.filter(p => (p.daysUntilStockout || 999) < 7).length
            }
        });
    } catch (error) {
        console.error('Predict Restock Error:', error);
        res.status(500).json({ error: 'Failed to predict restock needs' });
    }
};

// ==================== LISTING AGENT ====================

// Generate product listing
export const generateProductListing = async (req: Request, res: Response) => {
    try {
        const { productId } = req.params;

        if (!orKey) {
            return res.status(500).json({ error: 'OpenRouter API key not configured' });
        }

        const product = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const listing = await aiAgentService.listing.generateListing(product as any);

        res.json({
            success: true,
            productId,
            listing
        });
    } catch (error) {
        console.error('Listing Generation Error:', error);
        res.status(500).json({ error: 'Failed to generate listing' });
    }
};

// Generate product title
export const generateProductTitle = async (req: Request, res: Response) => {
    try {
        const { productId } = req.params;

        if (!orKey) {
            return res.status(500).json({ error: 'OpenRouter API key not configured' });
        }

        const product = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const title = await aiAgentService.listing.generateTitle(product as any);

        res.json({
            success: true,
            productId,
            title
        });
    } catch (error) {
        console.error('Title Generation Error:', error);
        res.status(500).json({ error: 'Failed to generate title' });
    }
};

// Generate product description
export const generateProductDescription = async (req: Request, res: Response) => {
    try {
        const { productId } = req.params;

        if (!orKey) {
            return res.status(500).json({ error: 'OpenRouter API key not configured' });
        }

        const product = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const description = await aiAgentService.listing.generateDescription(product as any);

        res.json({
            success: true,
            productId,
            description
        });
    } catch (error) {
        console.error('Description Generation Error:', error);
        res.status(500).json({ error: 'Failed to generate description' });
    }
};

// ==================== PRICING AGENT ====================

// Analyze competition for pricing
export const analyzePricing = async (req: Request, res: Response) => {
    try {
        const { productId } = req.params;

        if (!orKey) {
            return res.status(500).json({ error: 'OpenRouter API key not configured' });
        }

        const pricing = await aiAgentService.pricing.analyzeCompetition(productId);

        res.json({
            success: true,
            productId,
            pricing
        });
    } catch (error) {
        console.error('Pricing Analysis Error:', error);
        res.status(500).json({ error: 'Failed to analyze pricing' });
    }
};

// Suggest optimal price
export const suggestProductPrice = async (req: Request, res: Response) => {
    try {
        const { productId } = req.params;

        if (!orKey) {
            return res.status(500).json({ error: 'OpenRouter API key not configured' });
        }

        const suggestedPrice = await aiAgentService.pricing.suggestPrice(productId);

        res.json({
            success: true,
            productId,
            suggestedPrice
        });
    } catch (error) {
        console.error('Price Suggestion Error:', error);
        res.status(500).json({ error: 'Failed to suggest price' });
    }
};

// Optimize discounts for store
export const optimizeStoreDiscounts = async (req: Request, res: Response) => {
    try {
        const { storeId } = req.params;

        if (!orKey) {
            return res.status(500).json({ error: 'OpenRouter API key not configured' });
        }

        const recommendations = await aiAgentService.pricing.optimizeDiscounts(storeId);

        res.json({
            success: true,
            storeId,
            recommendations
        });
    } catch (error) {
        console.error('Discount Optimization Error:', error);
        res.status(500).json({ error: 'Failed to optimize discounts' });
    }
};
