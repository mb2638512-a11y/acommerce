import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { z } from 'zod';

const createReviewSchema = z.object({
    productId: z.string(),
    customerName: z.string(),
    rating: z.number().min(1).max(5),
    comment: z.string().optional()
});

export const createReview = async (req: Request, res: Response) => {
    try {
        const data = createReviewSchema.parse(req.body);

        const product = await prisma.product.findUnique({
            where: { id: data.productId },
            select: { id: true }
        });
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const review = await prisma.review.create({
            data: {
                productId: data.productId,
                customerName: data.customerName,
                rating: data.rating,
                comment: data.comment
            }
        });

        res.json(review);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create review' });
    }
};

export const getProductReviews = async (req: Request, res: Response) => {
    try {
        const { productId } = req.query;

        if (typeof productId !== 'string') return res.status(400).json({ error: 'Product ID required' });

        const reviews = await prisma.review.findMany({
            where: { productId },
            orderBy: { createdAt: 'desc' }
        });

        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
};
