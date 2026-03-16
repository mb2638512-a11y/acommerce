import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import { getStorePlan } from '../utils/storePlan';
import { z } from 'zod';

const assertOwner = async (storeId: string, userId?: string) => {
    if (!userId) return null;
    const store = await prisma.store.findUnique({
        where: { id: storeId },
        select: { id: true, ownerId: true, settings: true }
    });
    if (!store || store.ownerId !== userId) return null;
    return store;
};

const discountSchema = z.object({
    code: z.string().trim().min(3).max(40).regex(/^[a-zA-Z0-9_-]+$/),
    type: z.enum(['PERCENTAGE', 'FIXED']),
    value: z.number().positive(),
    active: z.boolean().optional().default(true)
});

const validateDiscountSchema = z.object({
    code: z.string().trim().min(3).max(40),
    subtotal: z.coerce.number().positive()
});

export const getDiscounts = async (req: AuthRequest, res: Response) => {
    try {
        const { storeId } = req.params;
        const store = await assertOwner(storeId, req.user?.userId);
        if (!store) return res.status(403).json({ error: 'Forbidden' });

        const discounts = await prisma.discountCode.findMany({
            where: { storeId }
        });
        res.json(discounts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch discounts' });
    }
};

export const createDiscount = async (req: AuthRequest, res: Response) => {
    try {
        const { storeId } = req.params;
        const { code, type, value, active } = discountSchema.parse(req.body);

        const store = await assertOwner(storeId, req.user?.userId);
        if (!store) return res.status(403).json({ error: 'Forbidden' });

        const plan = getStorePlan(store.settings);
        const discountCount = await prisma.discountCode.count({ where: { storeId } });
        if (discountCount >= plan.limits.maxDiscountCodes) {
            return res.status(403).json({
                error: `Plan limit reached. ${plan.label} supports up to ${plan.limits.maxDiscountCodes} discount codes.`
            });
        }

        if (type === 'PERCENTAGE' && value > 100) {
            return res.status(400).json({ error: 'Percentage discounts cannot exceed 100' });
        }

        const normalizedCode = code.toUpperCase();
        const existing = await prisma.discountCode.findFirst({
            where: { storeId, code: normalizedCode }
        });
        if (existing) {
            return res.status(409).json({ error: 'Discount code already exists' });
        }

        const discount = await prisma.discountCode.create({
            data: {
                storeId,
                code: normalizedCode,
                type,
                value,
                active
            }
        });
        res.json(discount);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Invalid discount payload' });
        }
        res.status(500).json({ error: 'Failed to create discount' });
    }
};

export const validateDiscount = async (req: AuthRequest, res: Response) => {
    try {
        const { storeId } = req.params;
        const { code, subtotal } = validateDiscountSchema.parse(req.query);
        const normalizedCode = code.toUpperCase();

        const discount = await prisma.discountCode.findFirst({
            where: {
                storeId,
                code: normalizedCode,
                active: true
            },
            select: { id: true, code: true, type: true, value: true }
        });
        if (!discount) {
            return res.status(404).json({ error: 'Discount code is invalid or inactive' });
        }

        const rawAmount = discount.type === 'PERCENTAGE' ? subtotal * (discount.value / 100) : discount.value;
        const discountAmount = Math.min(rawAmount, subtotal);

        res.json({
            code: discount.code,
            type: discount.type,
            value: discount.value,
            discountAmount
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Invalid discount validation request' });
        }
        res.status(500).json({ error: 'Failed to validate discount' });
    }
};

export const deleteDiscount = async (req: AuthRequest, res: Response) => {
    try {
        const { id, storeId } = req.params;
        const store = await assertOwner(storeId, req.user?.userId);
        if (!store) return res.status(403).json({ error: 'Forbidden' });

        const discount = await prisma.discountCode.findUnique({ where: { id } });
        if (!discount || discount.storeId !== storeId) {
            return res.status(404).json({ error: 'Discount not found' });
        }

        await prisma.discountCode.delete({
            where: { id }
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete discount' });
    }
};
