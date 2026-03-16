import { Response } from 'express';
import prisma from '../utils/prisma';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';

const getCartModel = () => {
    return (prisma as any).cart;
};

const syncCartSchema = z.object({
    storeId: z.string().min(1),
    items: z.array(z.any()),
    email: z.string().email().optional()
});

const abandonedCartSchema = z.object({
    storeId: z.string().min(1)
});

export const syncCart = async (req: AuthRequest, res: Response) => {
    try {
        const cartModel = getCartModel();
        if (!cartModel) {
            return res.status(501).json({ error: 'Cart model is not available in the generated Prisma client' });
        }

        const { storeId, items, email } = syncCartSchema.parse(req.body);
        const authUserId = req.user?.userId;
        const normalizedEmail = typeof email === 'string' ? email.toLowerCase() : undefined;

        if (!authUserId && !normalizedEmail) {
            return res.status(400).json({ error: 'Email is required for guest cart sync' });
        }

        let cart;
        if (authUserId) {
            cart = await cartModel.findFirst({ where: { storeId, userId: authUserId } });
        } else if (normalizedEmail) {
            cart = await cartModel.findFirst({ where: { storeId, email: normalizedEmail } });
        }

        if (cart) {
            cart = await cartModel.update({
                where: { id: cart.id },
                data: { items, updatedAt: new Date(), email: normalizedEmail, userId: authUserId || null }
            });
        } else {
            cart = await cartModel.create({
                data: {
                    storeId,
                    userId: authUserId,
                    email: normalizedEmail,
                    items
                }
            });
        }

        res.json(cart);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Invalid cart payload' });
        }
        res.status(500).json({ error: 'Failed to sync cart' });
    }
};

export const getAbandonedCarts = async (req: AuthRequest, res: Response) => {
    try {
        const cartModel = getCartModel();
        if (!cartModel) {
            return res.status(501).json({ error: 'Cart model is not available in the generated Prisma client' });
        }

        const { storeId } = abandonedCartSchema.parse({
            storeId: req.params.storeId || req.query.storeId
        });
        const userId = req.user?.userId;
        const role = req.user?.role;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const store = await prisma.store.findUnique({
            where: { id: storeId },
            select: { ownerId: true }
        });
        if (!store) return res.status(404).json({ error: 'Store not found' });
        if (role !== 'admin' && store.ownerId !== userId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const carts = await cartModel.findMany({
            where: {
                storeId,
                updatedAt: {
                    lt: new Date(Date.now() - 1000 * 60 * 60)
                }
            },
            orderBy: { updatedAt: 'desc' }
        });
        res.json(carts);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Store id is required' });
        }
        res.status(500).json({ error: 'Failed to fetch abandoned carts' });
    }
};
