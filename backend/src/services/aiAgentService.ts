/**
 * AI Autonomous Store Manager Service
 * 
 * Provides autonomous AI agents for e-commerce store management:
 * - SEO Agent: Auto-optimize product SEO
 * - Inventory Agent: Monitor and predict stock levels
 * - Listing Agent: Generate AI-powered product listings
 * - Pricing Agent: Analyze competition and suggest pricing
 */

import prisma from '../utils/prisma';
import { callOpenRouter } from './openRouterService';

// Types
interface ProductData {
   id: string;
   name: string;
   description: string;
   category?: string;
   price: number;
   compareAtPrice?: number;
   costPerItem?: number;
   sku?: number;
   stock?: number;
   tags?: string[];
}

interface StoreData {
   id: string;
   name: string;
   description?: string;
}

interface SEOData {
   metaTitle?: string;
   metaDescription?: string;
   keywords?: string[];
   schemaMarkup?: object;
}

interface PricingData {
   suggestedPrice?: number;
   competitorPrices?: CompetitorPrice[];
   discountRecommendation?: DiscountRecommendation;
}

interface CompetitorPrice {
   competitor: string;
   price: number;
   url?: string;
}

interface DiscountRecommendation {
   type: 'PERCENTAGE' | 'FIXED';
   value: number;
   reason: string;
}

interface InventoryAlert {
   productId: string;
   productName: string;
   currentStock: number;
   recommendedStock: number;
   urgency: 'LOW' | 'MEDIUM' | 'HIGH';
   reason: string;
}

interface RestockPrediction {
   productId: string;
   productName: string;
   daysUntilStockout?: number;
   recommendedRestockDate: Date;
   predictedDemand: number;
   confidence: number;
}

// Helper function to use OpenRouter with chat messages format
const chat = async (messages: { role: string; content: string }[]): Promise<string> => {
   const prompt = messages[messages.length - 1]?.content || '';
   return callOpenRouter(prompt, 'general', { responseFormat: { type: 'json_object' } });
};

// ============================================================================
// SEO AGENT
// ============================================================================

export class SEOAgent {
   /**
    * Auto-optimize SEO for a product
    * Generates meta title, description, and keywords
    */
   static async autoOptimizeSEO(productId: string): Promise<SEOData> {
      try {
         const product = await prisma.product.findUnique({
            where: { id: productId }
         });

         if (!product) {
            throw new Error('Product not found');
         }

         // Use OpenRouter AI to generate SEO content
         const prompt = `
Generate SEO optimization for this e-commerce product:

Product Name: ${product.name}
Product Description: ${product.description || 'No description'}
Category: ${product.category || 'General'}
Current Price: $${product.price}

Please provide:
1. A meta title (50-60 characters, include primary keyword)
2. A meta description (150-160 characters, compelling call to action)
3. 5-8 relevant keywords/tags

Respond in JSON format:
{
  "metaTitle": "string",
  "metaDescription": "string", 
  "keywords": ["string"]
}
`;

         const response = await chat([
            { role: 'user', content: prompt }
         ]);

         const seoData = JSON.parse(response);

         // Update product with SEO data using any to bypass strict type checking
         await (prisma.product as any).update({
            where: { id: productId },
            data: {
               metaTitle: seoData.metaTitle,
               metaDescription: seoData.metaDescription
            }
         });

         return seoData;
      } catch (error) {
         console.error('SEO Agent Error:', error);
         throw error;
      }
   }

   /**
    * Generate SEO keywords for a product
    */
   static async generateKeywords(productId: string): Promise<string[]> {
      try {
         const product = await prisma.product.findUnique({
            where: { id: productId }
         });

         if (!product) {
            throw new Error('Product not found');
         }

         const prompt = `
Generate 8-12 SEO keywords for this product:

Product: ${product.name}
Category: ${product.category || 'General'}
Description: ${product.description || ''}

Include:
- Primary keywords (1-2 words)
- Long-tail keywords (3-4 words)
- Related terms

Respond as JSON array of strings.
`;

         const response = await chat([
            { role: 'user', content: prompt }
         ]);

         return JSON.parse(response);
      } catch (error) {
         console.error('Generate Keywords Error:', error);
         throw error;
      }
   }

   /**
    * Generate JSON-LD Schema Markup for a product
    */
   static async generateSchemaMarkup(productId: string): Promise<object> {
      try {
         const product = await prisma.product.findUnique({
            where: { id: productId }
         });

         if (!product) {
            throw new Error('Product not found');
         }

         const prompt = `
Generate JSON-LD Schema.org Product markup for this product:

Product Name: ${product.name}
Description: ${product.description || ''}
Price: ${product.price}
SKU: ${product.sku || 'N/A'}
Category: ${product.category || 'General'}
In Stock: ${product.stock > 0 ? 'Yes' : 'No'}

Respond ONLY with valid JSON-LD (no explanation).
`;

         const response = await chat([
            { role: 'user', content: prompt }
         ]);

         return JSON.parse(response);
      } catch (error) {
         console.error('Schema Markup Error:', error);
         throw error;
      }
   }
}

// ============================================================================
// INVENTORY AGENT
// ============================================================================

export class InventoryAgent {
   /**
    * Analyze stock levels across a store
    */
   static async analyzeStockLevels(storeId: string): Promise<InventoryAlert[]> {
      try {
         const products = await prisma.product.findMany({
            where: { storeId }
         });

         const alerts: InventoryAlert[] = [];
         const LOW_STOCK_THRESHOLD = 10;
         const CRITICAL_STOCK_THRESHOLD = 5;

         for (const product of products) {
            const currentStock = product.stock || 0;

            if (currentStock <= 0) {
               alerts.push({
                  productId: product.id,
                  productName: product.name,
                  currentStock,
                  recommendedStock: 50,
                  urgency: 'HIGH',
                  reason: 'Product is out of stock'
               });
            } else if (currentStock <= CRITICAL_STOCK_THRESHOLD) {
               alerts.push({
                  productId: product.id,
                  productName: product.name,
                  currentStock,
                  recommendedStock: 30,
                  urgency: 'HIGH',
                  reason: 'Critical stock level - immediate restock needed'
               });
            } else if (currentStock <= LOW_STOCK_THRESHOLD) {
               alerts.push({
                  productId: product.id,
                  productName: product.name,
                  currentStock,
                  recommendedStock: 20,
                  urgency: 'MEDIUM',
                  reason: 'Low stock - consider restocking soon'
               });
            }
         }

         return alerts;
      } catch (error) {
         console.error('Inventory Analysis Error:', error);
         throw error;
      }
   }

   /**
    * Predict restock needs based on sales velocity
    */
   static async predictRestock(storeId: string): Promise<RestockPrediction[]> {
      try {
         const products = await prisma.product.findMany({
            where: { storeId }
         });

         const predictions: RestockPrediction[] = [];

         // Get orders count per product (simplified - would need orderItems in real implementation)
         for (const product of products) {
            const stock = product.stock || 0;
            if (stock <= 0) continue;

            // Simulated sales velocity (in real implementation, query actual orders)
            const avgDailySales = 0.5 + Math.random() * 2; // Simulated

            if (avgDailySales > 0) {
               const daysUntilStockout = Math.floor(stock / avgDailySales);
               const predictedDemand = Math.ceil(avgDailySales * 30);

               predictions.push({
                  productId: product.id,
                  productName: product.name,
                  daysUntilStockout,
                  recommendedRestockDate: new Date(Date.now() + (daysUntilStockout - 7) * 24 * 60 * 60 * 1000),
                  predictedDemand,
                  confidence: avgDailySales > 1 ? 0.8 : 0.5
               });
            }
         }

         // Sort by urgency
         return predictions.sort((a, b) =>
            (a.daysUntilStockout || 999) - (b.daysUntilStockout || 999)
         );
      } catch (error) {
         console.error('Predict Restock Error:', error);
         throw error;
      }
   }

   /**
    * Alert on low stock items
    */
   static async alertLowStock(storeId: string): Promise<InventoryAlert[]> {
      return this.analyzeStockLevels(storeId);
   }
}

// ============================================================================
// LISTING AGENT
// ============================================================================

export class ListingAgent {
   /**
    * Generate AI-powered product title
    */
   static async generateTitle(product: Partial<ProductData>): Promise<string> {
      try {
         const prompt = `
Generate an optimized product title (60-80 characters) for this product:

Name: ${product.name || ''}
Category: ${product.category || 'General'}
Key Features: ${product.description?.slice(0, 200) || ''}

The title should:
- Be compelling and descriptive
- Include relevant keywords
- Be SEO-friendly
- Not exceed 80 characters

Respond with ONLY the title, no explanation.
`;

         const response = await chat([
            { role: 'user', content: prompt }
         ]);

         return response.trim();
      } catch (error) {
         console.error('Generate Title Error:', error);
         throw error;
      }
   }

   /**
    * Generate AI product description
    */
   static async generateDescription(product: Partial<ProductData>): Promise<string> {
      try {
         const prompt = `
Generate a compelling product description for e-commerce:

Product Name: ${product.name || ''}
Category: ${product.category || 'General'}
Price: $${product.price || ''}
Current Description: ${product.description || 'None'}

Please create:
1. A short summary (1-2 sentences)
2. Key features (3-5 bullet points)
3. Benefits (2-3 points)

Make it engaging, SEO-friendly, and convert customers.
Respond in markdown format.
`;

         const response = await chat([
            { role: 'user', content: prompt }
         ]);

         return response.trim();
      } catch (error) {
         console.error('Generate Description Error:', error);
         throw error;
      }
   }

   /**
    * Suggest category for a product
    */
   static async suggestCategory(product: Partial<ProductData>): Promise<string> {
      try {
         const prompt = `
Suggest the most appropriate e-commerce category for this product:

Product Name: ${product.name || ''}
Description: ${product.description || ''}

Categories to choose from:
- Electronics
- Clothing & Apparel
- Home & Garden
- Sports & Outdoors
- Beauty & Health
- Toys & Games
- Books
- Food & Beverages
- Office Supplies
- Automotive
- Other

Respond with ONLY the category name.
`;

         const response = await chat([
            { role: 'user', content: prompt }
         ]);

         return response.trim();
      } catch (error) {
         console.error('Suggest Category Error:', error);
         throw error;
      }
   }

   /**
    * Generate full product listing
    */
   static async generateListing(product: Partial<ProductData>): Promise<{
      title: string;
      description: string;
      category: string;
      tags: string[];
   }> {
      try {
         const [title, description, category] = await Promise.all([
            this.generateTitle(product),
            this.generateDescription(product),
            this.suggestCategory(product)
         ]);

         // Generate tags
         const keywords = product.id ? await SEOAgent.generateKeywords(product.id) : [];

         return {
            title,
            description,
            category,
            tags: keywords.slice(0, 8)
         };
      } catch (error) {
         console.error('Generate Listing Error:', error);
         throw error;
      }
   }
}

// ============================================================================
// PRICING AGENT
// ============================================================================

export class PricingAgent {
   /**
    * Analyze competition for a product
    */
   static async analyzeCompetition(productId: string): Promise<PricingData> {
      try {
         const product = await prisma.product.findUnique({
            where: { id: productId }
         });

         if (!product) {
            throw new Error('Product not found');
         }

         // Get similar products in the marketplace (same category)
         const similarProducts = await prisma.product.findMany({
            where: {
               category: product.category,
               id: { not: productId }
            },
            take: 10
         });

         const competitorPrices: CompetitorPrice[] = similarProducts.map((p: any) => ({
            competitor: 'Store ' + p.storeId?.slice(0, 8) || 'Unknown',
            price: p.price,
            url: `/product/${p.id}`
         }));

         // Calculate price position
         const prices = competitorPrices.map(c => c.price);
         const avgPrice = prices.length > 0
            ? prices.reduce((a: number, b: number) => a + b, 0) / prices.length
            : product.price;

         return {
            suggestedPrice: avgPrice,
            competitorPrices,
            discountRecommendation: this.calculateDiscountRecommendation(
               product.price,
               avgPrice,
               product.costPerItem || 0
            )
         };
      } catch (error) {
         console.error('Competition Analysis Error:', error);
         throw error;
      }
   }

   /**
    * Suggest optimal price for a product
    */
   static async suggestPrice(productId: string): Promise<number> {
      try {
         const analysis = await this.analyzeCompetition(productId);

         if (analysis.suggestedPrice) {
            return Math.round(analysis.suggestedPrice * 100) / 100;
         }

         // Fallback to cost-based pricing
         const product = await prisma.product.findUnique({
            where: { id: productId }
         });

         if (!product) {
            throw new Error('Product not found');
         }

         const cost = product.costPerItem || 0;
         const markup = 1.5; // 50% margin
         return Math.round(cost * markup * 100) / 100;
      } catch (error) {
         console.error('Suggest Price Error:', error);
         throw error;
      }
   }

   /**
    * Optimize discounts for a store
    */
   static async optimizeDiscounts(storeId: string): Promise<DiscountRecommendation[]> {
      try {
         const products = await prisma.product.findMany({
            where: { storeId }
         });

         const recommendations: DiscountRecommendation[] = [];

         for (const product of products) {
            // Check stock levels
            const stock = product.stock || 0;

            if (stock > 20) {
               // High stock - recommend discount to clear inventory
               recommendations.push({
                  type: 'PERCENTAGE',
                  value: 10 + Math.floor(Math.random() * 15),
                  reason: `Clear excess inventory (${stock} units in stock)`
               });
            } else if (stock < 5 && stock > 0) {
               // Low stock - recommend price increase
               recommendations.push({
                  type: 'PERCENTAGE',
                  value: 5,
                  reason: 'Limited supply - opportunity for price increase'
               });
            }
         }

         return recommendations;
      } catch (error) {
         console.error('Optimize Discounts Error:', error);
         throw error;
      }
   }

   private static calculateDiscountRecommendation(
      currentPrice: number,
      avgCompetitorPrice: number,
      costPerItem: number
   ): DiscountRecommendation {
      const priceDiff = (avgCompetitorPrice - currentPrice) / currentPrice;

      if (priceDiff > 0.2) {
         return {
            type: 'PERCENTAGE',
            value: Math.round(priceDiff * 100),
            reason: 'Price is significantly above market average'
         };
      } else if (priceDiff < -0.1) {
         return {
            type: 'PERCENTAGE',
            value: 5,
            reason: 'Price is below market - consider slight increase'
         };
      }

      return {
         type: 'PERCENTAGE',
         value: 0,
         reason: 'Price is competitive'
      };
   }
}

// ============================================================================
// MAIN SERVICE EXPORTS
// ============================================================================

export const aiAgentService = {
   // SEO Agent
   seo: {
      autoOptimizeSEO: SEOAgent.autoOptimizeSEO,
      generateKeywords: SEOAgent.generateKeywords,
      generateSchemaMarkup: SEOAgent.generateSchemaMarkup
   },

   // Inventory Agent
   inventory: {
      analyzeStockLevels: InventoryAgent.analyzeStockLevels,
      predictRestock: InventoryAgent.predictRestock,
      alertLowStock: InventoryAgent.alertLowStock
   },

   // Listing Agent
   listing: {
      generateTitle: ListingAgent.generateTitle,
      generateDescription: ListingAgent.generateDescription,
      suggestCategory: ListingAgent.suggestCategory,
      generateListing: ListingAgent.generateListing
   },

   // Pricing Agent
   pricing: {
      analyzeCompetition: PricingAgent.analyzeCompetition,
      suggestPrice: PricingAgent.suggestPrice,
      optimizeDiscounts: PricingAgent.optimizeDiscounts
   }
};

export default aiAgentService;
