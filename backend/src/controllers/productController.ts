import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';
import { getStorePlan } from '../utils/storePlan';

const createProductSchema = z.object({
    name: z.string().trim().min(2).max(140),
    description: z.string().max(4000).optional(),
    category: z.string().max(120).optional(),
    status: z.enum(['ACTIVE', 'DRAFT', 'ARCHIVED']).optional(),
    price: z.coerce.number().positive(),
    compareAtPrice: z.coerce.number().nonnegative().optional(),
    costPerItem: z.coerce.number().nonnegative().optional(),
    stock: z.coerce.number().int().nonnegative(),
    sku: z.string().max(120).optional(),
    barcode: z.string().max(120).optional(),
    trackQuantity: z.boolean().optional(),
    images: z.array(z.string().min(1)).optional(),
    isFeatured: z.boolean().optional(),
    isDigital: z.boolean().optional(),
    variants: z.unknown().optional()
});

const updateProductSchema = createProductSchema.partial().refine(
    (value) => Object.keys(value).length > 0,
    'At least one field is required'
);

const resolveStoreOwnership = async (storeId: string, userId?: string) => {
    const store = await prisma.store.findUnique({ where: { id: storeId }, select: { ownerId: true, settings: true } });
    if (!store || store.ownerId !== userId) return null;
    return store;
};

export const createProduct = async (req: AuthRequest, res: Response) => {
    try {
        const { storeId } = req.params;
        const payload = createProductSchema.parse(req.body);
        const userId = req.user?.userId;

        const store = await resolveStoreOwnership(storeId, userId);
        if (!store) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const plan = getStorePlan(store.settings);
        const productCount = await prisma.product.count({ where: { storeId } });
        if (productCount >= plan.limits.maxProducts) {
            return res.status(403).json({
                error: `Plan limit reached. ${plan.label} supports up to ${plan.limits.maxProducts} products.`
            });
        }

        const product = await prisma.product.create({
            data: {
                storeId,
                name: payload.name,
                description: payload.description,
                category: payload.category,
                status: payload.status || 'ACTIVE',
                price: payload.price,
                compareAtPrice: payload.compareAtPrice,
                costPerItem: payload.costPerItem,
                stock: payload.stock,
                sku: payload.sku,
                barcode: payload.barcode,
                trackQuantity: payload.trackQuantity ?? true,
                images: payload.images || [],
                isFeatured: payload.isFeatured ?? false,
                isDigital: payload.isDigital ?? false,
                variants: payload.variants as any
            },
        });

        res.json(product);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Invalid product payload' });
        }
        res.status(400).json({ error: 'Failed to create product' });
    }
};

export const getStoreProducts = async (req: Request, res: Response) => {
    try {
        const { storeId } = req.params;
        const products = await prisma.product.findMany({
            where: { storeId, status: 'ACTIVE' },
            orderBy: { createdAt: 'desc' }
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
    try {
        const { storeId, productId } = req.params;
        const userId = req.user?.userId;
        const payload = updateProductSchema.parse(req.body);

        const store = await resolveStoreOwnership(storeId, userId);
        if (!store) return res.status(403).json({ error: 'Forbidden' });

        const existing = await prisma.product.findUnique({
            where: { id: productId },
            select: { id: true, storeId: true }
        });
        if (!existing || existing.storeId !== storeId) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const updated = await prisma.product.update({
            where: { id: productId },
            data: payload as any
        });
        res.json(updated);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Invalid product payload' });
        }
        res.status(500).json({ error: 'Failed to update product' });
    }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
    try {
        const { storeId, productId } = req.params;
        const userId = req.user?.userId;

        const store = await resolveStoreOwnership(storeId, userId);
        if (!store) return res.status(403).json({ error: 'Forbidden' });

        const existing = await prisma.product.findUnique({
            where: { id: productId },
            select: { id: true, storeId: true }
        });
        if (!existing || existing.storeId !== storeId) {
            return res.status(404).json({ error: 'Product not found' });
        }

        await prisma.product.delete({ where: { id: productId } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete product' });
    }
};
