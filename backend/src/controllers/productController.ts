import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';
import { getStorePlan } from '../utils/storePlan';
import { moderateProduct, isModerationEnabled, shouldBlockProduct } from '../services/contentModerationService';
import { createProductFlag } from './moderationController';

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
                error: 'Product limit reached',
                message: `Your ${plan.label} plan supports up to ${plan.limits.maxProducts} products. You've already created ${productCount} products.`,
                upgradeUrl: '/pricing',
                currentPlan: plan.label,
                limit: plan.limits.maxProducts,
                currentCount: productCount
            });
        }

        // Content Moderation Check
        let moderationResult = null;
        if (isModerationEnabled()) {
            moderationResult = await moderateProduct({
                name: payload.name,
                description: payload.description || '',
                category: payload.category || ''
            });

            if (shouldBlockProduct(moderationResult)) {
                return res.status(400).json({
                    error: 'Product violates content policy',
                    message: moderationResult.message,
                    flags: moderationResult.flags
                });
            }
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
                images: payload.images ? payload.images.join(',') : '',
                isFeatured: payload.isFeatured ?? false,
                isDigital: payload.isDigital ?? false,
                variants: payload.variants ? JSON.stringify(payload.variants) : null
            },
        });

        // Create moderation flag if product was not blocked but has flags
        if (moderationResult && moderationResult.flags.length > 0) {
            await createProductFlag(
                product.id,
                storeId,
                product.name,
                product.category,
                moderationResult
            );
        }

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

// Schema for adding virtual/dropship product
const virtualProductSchema = z.object({
    productId: z.string().uuid(),
    storeId: z.string().uuid(),
    price: z.coerce.number().positive()
});

// Get marketplace products for dropshipping (from other sellers)
export const getMarketplaceProducts = async (req: AuthRequest, res: Response) => {
    try {
        const { category, search, page = '1', limit = '20' } = req.query;
        const userId = req.user?.userId;

        const pageNum = parseInt(page as string) || 1;
        const limitNum = parseInt(limit as string) || 20;
        const skip = (pageNum - 1) * limitNum;

        // Build where clause - only get OWN inventory products from other stores
        const where: any = {
            inventoryType: 'OWN',
            status: 'ACTIVE',
            store: {
                // Exclude user's own store if logged in
                ...(userId ? { ownerId: { not: userId } } : {})
            }
        };

        if (category) {
            where.category = category as string;
        }

        if (search) {
            where.OR = [
                { name: { contains: search as string } },
                { description: { contains: search as string } }
            ];
        }

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    description: true,
                    category: true,
                    price: true,
                    images: true,
                    store: {
                        select: {
                            id: true,
                            name: true,
                            slug: true
                        }
                    }
                },
                skip,
                take: limitNum,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.product.count({ where })
        ]);

        res.json({
            products,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('Error fetching marketplace products:', error);
        res.status(500).json({ error: 'Failed to fetch marketplace products' });
    }
};

// Add a virtual product to own store (Dropshipping)
export const addVirtualProduct = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { productId, storeId, price } = virtualProductSchema.parse(req.body);

        // Verify the target store belongs to the user
        const targetStore = await prisma.store.findUnique({
            where: { id: storeId },
            select: { ownerId: true, settings: true }
        });

        if (!targetStore || targetStore.ownerId !== userId) {
            return res.status(403).json({ error: 'Forbidden - Store not owned by user' });
        }

        // Get the original product
        const originalProduct = await prisma.product.findUnique({
            where: { id: productId },
            include: { store: { select: { id: true, name: true } } }
        });

        if (!originalProduct) {
            return res.status(404).json({ error: 'Original product not found' });
        }

        if (originalProduct.inventoryType !== 'OWN') {
            return res.status(400).json({ error: 'Can only dropship OWN inventory products' });
        }

        if (originalProduct.storeId === storeId) {
            return res.status(400).json({ error: 'Cannot add your own product as virtual inventory' });
        }

        // Check if already added
        const existingVirtual = await prisma.product.findFirst({
            where: {
                storeId,
                originalProductId: productId
            }
        });

        if (existingVirtual) {
            return res.status(400).json({ error: 'Product already added to your store' });
        }

        // Create virtual product in user's store
        const virtualProduct = await prisma.product.create({
            data: {
                storeId,
                name: originalProduct.name,
                description: originalProduct.description,
                category: originalProduct.category,
                price,
                compareAtPrice: originalProduct.compareAtPrice,
                costPerItem: originalProduct.costPerItem,
                stock: originalProduct.stock,
                sku: originalProduct.sku,
                barcode: originalProduct.barcode,
                trackQuantity: originalProduct.trackQuantity,
                images: originalProduct.images,
                isFeatured: false,
                isDigital: originalProduct.isDigital,
                variants: originalProduct.variants,
                inventoryType: 'VIRTUAL',
                originalProductId: productId,
                originalStoreId: originalProduct.storeId,
                commissionRate: 0 // No commission for virtual - seller sets their own price
            }
        });

        res.status(201).json({
            success: true,
            product: virtualProduct,
            sourceStore: originalProduct.store
        });
    } catch (error) {
        console.error('Error adding virtual product:', error);
        res.status(500).json({ error: 'Failed to add virtual product' });
    }
};
