import { Request, Response } from 'express';
import { GoogleGenAI } from "@google/genai";
import { z } from 'zod';

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const generateSchema = z.object({
    prompt: z.string().trim().min(1).max(4000),
    model: z.string().trim().min(1).max(120).optional(),
    type: z.enum(['text', 'json']).optional()
});

export const generateContent = async (req: Request, res: Response) => {
    try {
        const { prompt, model = 'gemini-1.5-flash', type = 'text' } = generateSchema.parse(req.body);

        if (!apiKey) {
            return res.status(500).json({ error: 'Server AI configuration missing' });
        }

        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: type === 'json' ? { responseMimeType: 'application/json' } : undefined
        });

        res.json({ text: response.text });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Invalid AI request payload' });
        }
        console.error("AI Generation Error:", error);
        res.status(500).json({ error: 'Failed to generate content' });
    }
};
