import { Response } from 'express';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import { getStorePlan, getStorePlanTier, withUpdatedPlanSettings } from '../utils/storePlan';
import { isPlanTier, PLATFORM_PLANS } from '../config/platformPlans';

const updatePlanSchema = z.object({
    tier: z.string()
});

const canManageStorePlan = (ownerId: string, userId?: string, role?: string) => {
    if (!userId) return false;
    if (role === 'admin') return true;
    return ownerId === userId;
};

export const getStoreBilling = async (req: AuthRequest, res: Response) => {
    try {
        const { storeId } = req.params;
        const userId = req.user?.userId;
        const role = req.user?.role;

        const store = await prisma.store.findUnique({
            where: { id: storeId },
            include: {
                products: { select: { id: true } },
                discounts: { select: { id: true } }
            }
        });

        if (!store) {
            return res.status(404).json({ error: 'Store not found' });
        }

        if (!canManageStorePlan(store.ownerId, userId, role)) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const plan = getStorePlan(store.settings);
        const usage = {
            products: store.products.length,
            discounts: store.discounts.length
        };

        res.json({
            tier: plan.tier,
            plan,
            usage,
            remaining: {
                products: Math.max(plan.limits.maxProducts - usage.products, 0),
                discounts: Math.max(plan.limits.maxDiscountCodes - usage.discounts, 0)
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch billing details' });
    }
};

export const updateStorePlan = async (req: AuthRequest, res: Response) => {
    try {
        const { storeId } = req.params;
        const userId = req.user?.userId;
        const role = req.user?.role;
        const { tier } = updatePlanSchema.parse(req.body);

        if (!isPlanTier(tier)) {
            return res.status(400).json({ error: 'Invalid plan tier' });
        }

        const store = await prisma.store.findUnique({
            where: { id: storeId },
            select: { id: true, ownerId: true, settings: true }
        });

        if (!store) {
            return res.status(404).json({ error: 'Store not found' });
        }

        if (!canManageStorePlan(store.ownerId, userId, role)) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const updatedSettings = withUpdatedPlanSettings(store.settings, tier);
        await prisma.store.update({
            where: { id: storeId },
            data: { settings: updatedSettings as Prisma.InputJsonValue }
        });

        res.json({
            tier,
            plan: PLATFORM_PLANS[tier]
        });
    } catch (error) {
        res.status(400).json({ error: 'Failed to update plan' });
    }
};

export const getPlanCatalog = async (req: AuthRequest, res: Response) => {
    res.json({
        plans: Object.values(PLATFORM_PLANS)
    });
};

export const getStorePlanSummary = async (req: AuthRequest, res: Response) => {
    try {
        const { storeId } = req.params;
        const store = await prisma.store.findUnique({
            where: { id: storeId },
            select: { settings: true }
        });
        if (!store) return res.status(404).json({ error: 'Store not found' });

        const tier = getStorePlanTier(store.settings);
        res.json({ tier, plan: PLATFORM_PLANS[tier] });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch plan summary' });
    }
};
