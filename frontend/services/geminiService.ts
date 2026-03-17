import api from '../src/lib/api';

interface AIResponse {
  text: string;
}

export const generateProductDescription = async (productName: string, keywords: string): Promise<string> => {
  try {
    const response = await api.post<AIResponse>('/ai/generate', {
      prompt: `Write a compelling, SEO-friendly product description for an e-commerce product named "${productName}". Key features/keywords: ${keywords}. Keep it under 100 words. Tone: Professional and persuasive.`
    });
    return response.data.text || "No description generated.";
  } catch (error) {
    console.error("AI Error:", error);
    return "Failed to generate description.";
  }
};

export const generateStoreNameIdeas = async (niche: string): Promise<string[]> => {
  try {
    const response = await api.post<AIResponse>('/ai/generate', {
      prompt: `List 5 creative, catchy, and modern store names for a shop that sells: ${niche}. Return only the names separated by commas, no numbers or bullets.`
    });
    const text = response.data.text || "";
    return text.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
  } catch (error) {
    return ["Error generating names"];
  }
};

export const generateStoreDescription = async (name: string, niche: string): Promise<string> => {
  try {
    const response = await api.post<AIResponse>('/ai/generate', {
      prompt: `Write a short, inspiring 2-sentence description for an online store named "${name}" that sells "${niche}". Tone: Welcoming and professional.`
    });
    return response.data.text || "";
  } catch (error) {
    return "";
  }
};

export const generateMarketingContent = async (type: 'email' | 'social', productName: string, discount?: string): Promise<string> => {
  try {
    const prompt = type === 'email'
      ? `Write a short, promotional email subject line and body for a product named "${productName}"${discount ? ` with a special offer: ${discount}` : ''}.`
      : `Write a catchy Instagram caption with hashtags for the product "${productName}"${discount ? ` mentioning deal: ${discount}` : ''}.`;

    const response = await api.post<AIResponse>('/ai/generate', { prompt });
    return response.data.text || "Content generation failed.";
  } catch (error) {
    return "Failed to generate content.";
  }
};

export const generateSEOData = async (productName: string, description: string) => {
  try {
    const response = await api.post<AIResponse>('/ai/generate', {
      prompt: `Generate an SEO Title (max 60 chars) and Meta Description (max 160 chars) for product: "${productName}". Description: "${description}". Format as JSON: { "title": "...", "meta": "..." }`,
      type: 'json'
    });
    return JSON.parse(response.data.text || '{}');
  } catch (error) {
    return { title: productName, meta: description.substring(0, 150) };
  }
};

export const generatePriceSuggestion = async (productName: string, category: string, description: string): Promise<string> => {
  try {
    const response = await api.post<AIResponse>('/ai/generate', {
      prompt: `Suggest a realistic price range in USD for a product named "${productName}" in the category "${category}". Description: ${description}. Return only the price range string (e.g. "$40 - $60").`
    });
    return response.data.text || "Unavailable";
  } catch (error) {
    return "Unavailable";
  }
};

export const generateBlogPost = async (topic: string, storeNiche: string): Promise<{ title: string; content: string; excerpt: string; tags: string[]; seoTitle: string; seoDescription: string }> => {
  try {
    const response = await api.post<AIResponse>('/ai/generate', {
      prompt: `Write a blog post about "${topic}" for an online store selling ${storeNiche}. 
            Return JSON in this format: 
            { 
              "title": "Compelling Title", 
              "content": "Full article content (at least 3 paragraphs)", 
              "excerpt": "Short 2 sentence summary",
              "tags": ["tag1", "tag2"],
              "seoTitle": "SEO optimized title under 60 chars",
              "seoDescription": "SEO meta description under 160 chars"
            }`,
      type: 'json'
    });
    return JSON.parse(response.data.text || '{}');
  } catch (error) {
    return {
      title: "Generation Failed",
      content: "Please try again.",
      excerpt: "",
      tags: [],
      seoTitle: "",
      seoDescription: ""
    };
  }
};

export const generateRelatedProducts = async (productName: string, category: string): Promise<string[]> => {
  try {
    const response = await api.post<AIResponse>('/ai/generate', {
      prompt: `Suggest 5 related product names that would be good cross-sells or upsells for a "${productName}" in the category "${category}". Return only the list of 5 product names separated by commas.`
    });
    const text = response.data.text || "";
    return text.split(',').map(s => s.trim()).filter(s => s.length > 0);
  } catch (error) {
    return ["Error generating recommendations"];
  }
};

export const chatWithAI = async (message: string, context: any): Promise<string> => {
  try {
    const prompt = `
      You are a helpful AI assistant for an online store named "${context.storeName}".
      The store sells: "${context.niche}".
      
      Here is some context about the store:
      - Currency: ${context.currency}
      - Top Products: ${context.products.map((p: any) => `${p.name} ($${p.price})`).join(', ')}
      
      User Message: "${message}"
      
      Provide a helpful, friendly, and concise response. If asking about a product, mention its price.
      If you don't know the answer, suggest they contact support at ${context.supportEmail || 'support@example.com'}.
    `;

    const response = await api.post<AIResponse>('/ai/generate', { prompt });
    return response.data.text || "I'm having trouble connecting right now. Please try again later.";
  } catch (error) {
    console.error("Chat Error:", error);
    return "I'm currently offline. Please contact support.";
  }
};

export const analyzeSentiment = async (content: string): Promise<{ sentiment: 'positive' | 'neutral' | 'negative', score: number, summary: string }> => {
  try {
    const response = await api.post<AIResponse>('/ai/generate', {
      prompt: `Analyze the sentiment of the following customer feedback: "${content}". 
      Return JSON: { "sentiment": "positive"|"neutral"|"negative", "score": 0-1, "summary": "short summary" }`,
      type: 'json',
      model: 'nvidia/llama-3.1-nemotron-70b-instruct'
    });
    return JSON.parse(response.data.text || '{}');
  } catch (error) {
    return { sentiment: 'neutral', score: 0.5, summary: "Analysis failed." };
  }
};

export const translateContent = async (text: string, targetLang: string): Promise<string> => {
  try {
    const response = await api.post<AIResponse>('/ai/generate', {
      prompt: `Translate the following text to ${targetLang}: "${text}". Return only the translated text.`,
      model: 'meta-llama/llama-3.1-8b-instruct'
    });
    return response.data.text || text;
  } catch (error) {
    return text;
  }
};

export const getPersonalizedRecommendations = async (history: string[], categories: string[]): Promise<string[]> => {
  try {
    const response = await api.post<AIResponse>('/ai/generate', {
      prompt: `Based on a user who viewed ${history.join(', ')} in categories ${categories.join(', ')}, suggest 4 relevant products they might like. Return only the names separated by commas.`,
      model: 'qwen/qwen-2.5-32b-instruct'
    });
    const text = response.data.text || "";
    return text.split(',').map(s => s.trim()).filter(s => s.length > 0);
  } catch (error) {
    return [];
  }
};