import api from '../src/lib/api';

// ==================== TYPES ====================

export interface SentimentResult {
 sentiment: 'positive' | 'neutral' | 'negative';
 score: number;
 summary: string;
 emotions?: string[];
 keyPhrases?: string[];
 suggestion?: string;
}

export interface TranslationResult {
 originalText: string;
 translatedText: string;
 sourceLanguage: string;
 targetLanguage: string;
}

export interface Recommendation {
 reason: string;
 confidence: number;
 productType: 'complement' | 'upgrade' | 'similar' | 'accessory';
}

export interface CustomerSegment {
 customerIds: string[];
 count: number;
}

export interface SegmentationResult {
 storeId: string;
 totalCustomers: number;
 segments: Record<string, CustomerSegment>;
 insights: {
  retentionRisk: string;
  growthPotential: string;
  recommendations: string[];
 };
}

// ==================== SENTIMENT ANALYSIS ====================

export const analyzeSentiment = async (
 content: string,
 context: 'review' | 'feedback' | 'support_ticket' | 'general' = 'general'
): Promise<SentimentResult> => {
 try {
  const response = await api.post<SentimentResult>('/ai/sentiment', {
   content,
   context
  });
  return response.data;
 } catch (error) {
  console.error('Sentiment Analysis Error:', error);
  return {
   sentiment: 'neutral',
   score: 0.5,
   summary: 'Analysis failed. Please try again.'
  };
 }
};

export const analyzeBatchSentiment = async (
 items: { id: string; content: string }[]
): Promise<{
 results: SentimentResult[];
 summary: {
  total: number;
  successful: number;
  failed: number;
  positive: number;
  neutral: number;
  negative: number;
 };
 failedIds: string[];
}> => {
 try {
  const response = await api.post('/ai/sentiment/batch', { items });
  return response.data;
 } catch (error) {
  console.error('Batch Sentiment Error:', error);
  return {
   results: [],
   summary: { total: 0, successful: 0, failed: 0, positive: 0, neutral: 0, negative: 0 },
   failedIds: items.map(i => i.id)
  };
 }
};

export const analyzeProductReviews = async (
 productId: string,
 storeId: string
): Promise<{
 productId: string;
 reviewCount: number;
 summary: {
  positive: number;
  neutral: number;
  negative: number;
  averageRating: number;
  overallSentiment: string;
 };
 keyThemes: string[];
 topPositivePoints: string[];
 topNegativePoints: string[];
 recommendation: string;
 reviews: any[];
}> => {
 try {
  const response = await api.get(`/ai/sentiment/product/${productId}`, {
   params: { storeId }
  });
  return response.data;
 } catch (error) {
  console.error('Product Reviews Analysis Error:', error);
  throw error;
 }
};

// ==================== TRANSLATION ====================

export const translateContent = async (
 text: string,
 targetLanguage: string,
 sourceLanguage?: string
): Promise<TranslationResult> => {
 try {
  const response = await api.post<TranslationResult>('/ai/translate', {
   text,
   targetLanguage,
   sourceLanguage
  });
  return response.data;
 } catch (error) {
  console.error('Translation Error:', error);
  throw error;
 }
};

export const translateBatchContent = async (
 items: { id: string; text: string }[],
 targetLanguage: string
): Promise<{
 targetLanguage: string;
 results: { id: string; translatedText: string }[];
 summary: { total: number; successful: number; failed: number };
 failedIds: string[];
}> => {
 try {
  const response = await api.post('/ai/translate/batch', {
   items,
   targetLanguage
  });
  return response.data;
 } catch (error) {
  console.error('Batch Translation Error:', error);
  return {
   targetLanguage,
   results: [],
   summary: { total: 0, successful: 0, failed: 0 },
   failedIds: items.map(i => i.id)
  };
 }
};

export const translateProductContent = async (
 productId: string,
 targetLanguage: string,
 sourceLanguage?: string
): Promise<{
 productId: string;
 original: { name: string; description: string | null; category: string | null };
 translated: {
  translatedName: string;
  translatedDescription: string;
  translatedCategory: string;
 };
 targetLanguage: string;
}> => {
 try {
  const response = await api.post(`/ai/translate/product/${productId}`, {
   targetLanguage,
   sourceLanguage
  });
  return response.data;
 } catch (error) {
  console.error('Product Translation Error:', error);
  throw error;
 }
};

// ==================== RECOMMENDATIONS ====================

export const getPersonalizedRecommendations = async (options: {
 customerId?: string;
 viewedProducts?: string[];
 purchasedProducts?: string[];
 categories?: string[];
 limit?: number;
}): Promise<{
 customerId?: string;
 recommendations: Recommendation[];
 recommendedProducts: any[];
 insight: string;
}> => {
 try {
  const response = await api.post('/ai/recommendations', options);
  return response.data;
 } catch (error) {
  console.error('Recommendations Error:', error);
  return {
   recommendations: [],
   recommendedProducts: [],
   insight: 'Unable to generate recommendations at this time.'
  };
 }
};

export const getRelatedProducts = async (
 productId: string,
 limit: number = 8
): Promise<{
 sourceProduct: { id: string; name: string; category: string | null; price: number };
 aiSuggestions: {
  crossSells: string[];
  upSells: string[];
  relatedItems: string[];
 };
 sameCategoryProducts: any[];
}> => {
 try {
  const response = await api.get(`/ai/recommendations/related/${productId}`, {
   params: { limit }
  });
  return response.data;
 } catch (error) {
  console.error('Related Products Error:', error);
  throw error;
 }
};

// ==================== AUDIENCE SEGMENTATION ====================

export const segmentCustomers = async (
 storeId: string,
 options?: {
  segmentTypes?: Array<
   | 'high_value'
   | 'at_risk'
   | 'new_customers'
   | 'loyal'
   | 'occasional'
   | 'big_spenders'
   | 'bargain_hunters'
   | 'dormant'
  >;
  minOrderValue?: number;
  minOrderCount?: number;
 }
): Promise<SegmentationResult> => {
 try {
  const response = await api.post<SegmentationResult>('/ai/segmentation', {
   storeId,
   ...options
  });
  return response.data;
 } catch (error) {
  console.error('Segmentation Error:', error);
  throw error;
 }
};

export const getSegmentDetails = async (
 storeId: string,
 segment: string,
 minValue?: number,
 minOrders?: number
): Promise<{
 storeId: string;
 segment: string;
 count: number;
 customers: any[];
}> => {
 try {
  const response = await api.get(`/ai/segmentation/${storeId}`, {
   params: { segment, minValue, minOrders }
  });
  return response.data;
 } catch (error) {
  console.error('Segment Details Error:', error);
  throw error;
 }
};
