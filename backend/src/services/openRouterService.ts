import { env } from '../config/env';

// Cache for API responses (simple in-memory cache)
const responseCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface OpenRouterRequest {
 model: string;
 messages: { role: string; content: string }[];
 response_format?: { type: string };
 temperature?: number;
 max_tokens?: number;
}

interface OpenRouterResponse {
 choices: { message: { content: string } }[];
 error?: { message: string };
}

interface ModelFallback {
 primary: string;
 fallback: string;
}

const DEFAULT_FALLBACKS: Record<string, ModelFallback> = {
 sentiment: {
  primary: 'nvidia/llama-3.1-nemotron-70b-instruct',
  fallback: 'meta-llama/llama-3.1-8b-instruct'
 },
 translation: {
  primary: 'meta-llama/llama-3.1-8b-instruct',
  fallback: 'qwen/qwen-2.5-72b-instruct'
 },
 recommendations: {
  primary: 'qwen/qwen-2.5-32b-instruct',
  fallback: 'meta-llama/llama-3.1-8b-instruct'
 },
 segmentation: {
  primary: 'meta-llama/llama-3.1-8b-instruct',
  fallback: 'deepseek/deepseek-chat'
 },
 general: {
  primary: 'meta-llama/llama-3.1-8b-instruct',
  fallback: 'qwen/qwen-2.5-72b-instruct'
 }
};

/**
 * Generate a cache key from the request
 */
function generateCacheKey(request: OpenRouterRequest): string {
 return `${request.model}:${JSON.stringify(request.messages)}`;
}

/**
 * Get cached response if available and not expired
 */
function getCachedResponse(key: string): string | null {
 const cached = responseCache.get(key);
 if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
  return cached.data;
 }
 responseCache.delete(key);
 return null;
}

/**
 * Cache a response
 */
function setCachedResponse(key: string, data: string): void {
 // Limit cache size to prevent memory issues
 if (responseCache.size > 100) {
  const firstKey = responseCache.keys().next().value;
  if (firstKey) responseCache.delete(firstKey);
 }
 responseCache.set(key, { data, timestamp: Date.now() });
}

/**
 * Call OpenRouter API with fallback support
 */
export async function callOpenRouter(
 prompt: string,
 feature: keyof typeof DEFAULT_FALLBACKS = 'general',
 options: {
  responseFormat?: { type: string };
  temperature?: number;
  maxTokens?: number;
  useCache?: boolean;
 } = {}
): Promise<string> {
 const { responseFormat, temperature = 0.7, maxTokens = 2048, useCache = false } = options;

 const modelConfig = DEFAULT_FALLBACKS[feature] || DEFAULT_FALLBACKS.general;
 const models = [modelConfig.primary, modelConfig.fallback];

 const request: OpenRouterRequest = {
  model: modelConfig.primary,
  messages: [{ role: 'user', content: prompt }],
  response_format: responseFormat,
  temperature,
  max_tokens: maxTokens
 };

 // Check cache first
 if (useCache) {
  const cacheKey = generateCacheKey(request);
  const cachedResponse = getCachedResponse(cacheKey);
  if (cachedResponse) {
   return cachedResponse;
  }
 }

 let lastError: Error | null = null;

 for (const model of models) {
  try {
   request.model = model;

   const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
     'Authorization': `Bearer ${env.openRouterApiKey}`,
     'Content-Type': 'application/json',
     'HTTP-Referer': 'https://aureon-commerce.com',
     'X-Title': 'Aureon Commerce'
    },
    body: JSON.stringify(request)
   });

   if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `API error: ${response.status}`);
   }

   const data: OpenRouterResponse = await response.json();

   if (data.error) {
    throw new Error(data.error.message);
   }

   if (!data.choices || data.choices.length === 0) {
    throw new Error('No response choices returned');
   }

   const result = data.choices[0].message.content;

   // Cache the successful response
   if (useCache) {
    const cacheKey = generateCacheKey(request);
    setCachedResponse(cacheKey, result);
   }

   return result;
  } catch (error) {
   lastError = error as Error;
   console.warn(`OpenRouter model ${model} failed, trying fallback...`, error);
   continue;
  }
 }

 throw new Error(`All models failed. Last error: ${lastError?.message}`);
}

/**
 * Clear the response cache
 */
export function clearCache(): void {
 responseCache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; ttl: number } {
 return {
  size: responseCache.size,
  ttl: CACHE_TTL
 };
}
