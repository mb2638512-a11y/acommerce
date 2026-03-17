import { env } from '../config/env';

/**
 * Content Moderation Types
 */
export interface ModerationResult {
 isAllowed: boolean;
 category: string;
 confidence: number;
 flags: string[];
 message: string;
}

export interface ProductToModerate {
 name: string;
 description: string;
 category: string;
 images?: string[];
}

/**
 * Prohibited Categories for ACommerce (Halal/Ethical Compliance)
 */
const PROHIBITED_CATEGORIES = [
 'weapons',
 'firearms',
 'guns',
 'ammunition',
 'explosives',
 'alcohol',
 'tobacco',
 'cigarettes',
 'pork',
 'non-halal',
 'haram',
 'drugs',
 'narcotics',
 'marijuana',
 'cannabis',
 'adult',
 'pornography',
 'sex',
 'counterfeit',
 'fake',
 'stolen',
 'illegal',
 'weaponry',
 'knives',
 'blades',
 'tasers',
 'pepper spray',
];

const CATEGORY_KEYWORDS: Record<string, string[]> = {
 'Weapons & Firearms': ['gun', 'pistol', 'rifle', 'shotgun', 'weapon', 'ammunition', 'bullet', 'explosive', 'bomb', 'knife', 'blade', 'taser', 'stun gun', 'pepper spray', 'mace'],
 'Alcohol & Tobacco': ['alcohol', 'wine', 'beer', 'vodka', 'whiskey', 'rum', 'brandy', 'tobacco', 'cigarette', 'cigar', 'hookah', 'shisha', 'vape', 'e-cigarette', 'smoking'],
 'Pork & Non-Halal': ['pork', 'bacon', 'ham', 'sausage', 'lard', 'non-halal', 'haram', 'pig', 'boar', 'gelatin', 'alcohol-based'],
 'Drugs & Narcotics': ['drug', 'marijuana', 'cannabis', 'weed', 'pot', 'heroin', 'cocaine', 'meth', ' LSD', 'ecstasy', 'pill', 'prescription', 'narcotic'],
 'Adult Content': ['adult', 'porn', 'sex', 'nude', 'nsfw', '18+', 'xxx', 'sexual', 'dildo', 'vibrator', 'condom', 'erotic'],
 'Counterfeit Goods': ['counterfeit', 'fake', 'replica', 'knockoff', 'replica', 'clone', 'imitation', 'pirated'],
 'Stolen Property': ['stolen', 'hot', 'theft', 'illegal'],
 'Illegal Services': ['hacker', 'hacking', 'hitman', 'assassin', 'kill', 'murder', 'scam', 'fraud'],
};

/**
 * Analyze product content for prohibited items
 * Uses keyword matching combined with optional AI analysis
 */
export const moderateProduct = async (product: ProductToModerate): Promise<ModerationResult> => {
 const content = `${product.name} ${product.description} ${product.category}`.toLowerCase();
 const flags: string[] = [];
 let detectedCategory = '';
 let highestConfidence = 0;

 // Check for prohibited category keywords
 for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
  for (const keyword of keywords) {
   if (content.includes(keyword.toLowerCase())) {
    flags.push(`${category}: Found "${keyword}"`);
    detectedCategory = category;
    highestConfidence = Math.max(highestConfidence, 0.9);
   }
  }
 }

 // Check if category itself is prohibited
 const categoryLower = product.category?.toLowerCase() || '';
 for (const prohibited of PROHIBITED_CATEGORIES) {
  if (categoryLower.includes(prohibited)) {
   flags.push(`Prohibited category: ${product.category}`);
   detectedCategory = 'Prohibited Category';
   highestConfidence = Math.max(highestConfidence, 0.95);
  }
 }

 // Check product name for prohibited terms
 const nameLower = product.name.toLowerCase();
 for (const prohibited of PROHIBITED_CATEGORIES) {
  if (nameLower.includes(prohibited)) {
   flags.push(`Prohibited term in name: ${prohibited}`);
   detectedCategory = 'Prohibited Term';
   highestConfidence = Math.max(highestConfidence, 1.0);
  }
 }

 // If AI moderation is enabled and configured, use it for additional analysis
 if (env.geminiApiKey || env.openRouterApiKey) {
  try {
   const aiResult = await moderateWithAI(product);
   if (aiResult.confidence > highestConfidence) {
    detectedCategory = aiResult.category;
    highestConfidence = aiResult.confidence;
    flags.push(...aiResult.flags);
   }
  } catch (error) {
   console.error('AI moderation failed, using keyword-based result:', error);
  }
 }

 // Determine if allowed based on flags
 const isAllowed = flags.length === 0 || highestConfidence < 0.7;

 let message = '';
 if (!isAllowed) {
  message = `This product has been flagged for violating our content policy. Category: ${detectedCategory}. Please contact support if you believe this is an error.`;
 } else if (flags.length > 0 && highestConfidence >= 0.5) {
  message = `This product requires review. Potential concerns: ${flags.join(', ')}`;
 } else {
  message = 'Product passed content moderation checks.';
 }

 return {
  isAllowed,
  category: detectedCategory || 'Allowed',
  confidence: highestConfidence,
  flags,
  message,
 };
};

/**
 * Optional AI-based moderation using Gemini or OpenRouter
 */
const moderateWithAI = async (product: ProductToModerate): Promise<ModerationResult> => {
 const prompt = `You are a content moderation system for an ethical e-commerce platform called ACommerce.
Your job is to analyze products and identify if they violate our content policy.

PROHIBITED CATEGORIES:
1. Weapons & Firearms - guns, knives, explosives, etc.
2. Alcohol & Tobacco - alcoholic beverages, cigarettes, vapes
3. Pork & Non-Halal products - pork, non-halal food, etc.
4. Drugs & Narcotics - illegal substances, prescription drugs
5. Adult Content - explicit materials, adult toys
6. Counterfeit Goods - fake/replica products
7. Stolen Property - illegal goods
8. Illegal Services - hacking, fraud, etc.

Product to analyze:
- Name: ${product.name}
- Description: ${product.description}
- Category: ${product.category}

Respond with JSON in this format:
{
  "isAllowed": true/false,
  "category": "category name or 'Allowed'",
  "confidence": 0.0-1.0,
  "flags": ["specific flag descriptions"],
  "message": "brief explanation"
}

Only flag products that are clearly prohibited. Be lenient on borderline items.`;

 try {
  // Try OpenRouter first (supports various AI models)
  if (env.openRouterApiKey) {
   const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
     'Content-Type': 'application/json',
     'Authorization': `Bearer ${env.openRouterApiKey}`,
     'HTTP-Referer': 'https://acommerce.com',
    },
    body: JSON.stringify({
     model: 'anthropic/claude-3-haiku',
     messages: [{ role: 'user', content: prompt }],
     max_tokens: 500,
    }),
   });

   if (response.ok) {
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (content) {
     try {
      const parsed = JSON.parse(content);
      return {
       isAllowed: parsed.isAllowed ?? true,
       category: parsed.category ?? 'Unknown',
       confidence: parsed.confidence ?? 0.5,
       flags: parsed.flags ?? [],
       message: parsed.message ?? 'AI moderation completed',
      };
     } catch {
      console.error('Failed to parse AI response');
     }
    }
   }
  }
 } catch (error) {
  console.error('AI moderation error:', error);
 }

 // Return neutral result if AI fails
 return {
  isAllowed: true,
  category: 'Unknown',
  confidence: 0,
  flags: [],
  message: 'AI moderation unavailable, using keyword-based analysis',
 };
};

/**
 * Moderate multiple products in bulk
 */
export const moderateBulkProducts = async (products: ProductToModerate[]): Promise<ModerationResult[]> => {
 const results: ModerationResult[] = [];

 for (const product of products) {
  const result = await moderateProduct(product);
  results.push(result);
 }

 return results;
};

/**
 * Check if content moderation is enabled
 */
export const isModerationEnabled = (): boolean => {
 return process.env.CONTENT_MODERATION_ENABLED === 'true';
};

/**
 * Check if strict mode is enabled (blocks products with lower confidence)
 */
export const isStrictMode = (): boolean => {
 return process.env.MODERATION_STRICT_MODE === 'true';
};

/**
 * Apply strict mode threshold
 * In strict mode, products with confidence >= 0.5 are blocked
 * In normal mode, only products with confidence >= 0.7 are blocked
 */
export const shouldBlockProduct = (result: ModerationResult): boolean => {
 const threshold = isStrictMode() ? 0.5 : 0.7;
 return !result.isAllowed || result.confidence >= threshold;
};
