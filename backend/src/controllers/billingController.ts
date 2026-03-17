import { Response } from 'express';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import { getStorePlan, getStorePlanTier, withUpdatedPlanSettings } from '../utils/storePlan';
import { isPlanTier, PLATFORM_PLANS } from '../config/platformPlans';
import { createCheckoutSession as createStripeSession, createStripeCustomer } from '../utils/stripeService';

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

        const plan = getStorePlan(typeof store.settings === 'string' ? JSON.parse(store.settings) : store.settings);
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

        const updatedSettings = withUpdatedPlanSettings(
            typeof store.settings === 'string' ? JSON.parse(store.settings) : store.settings, 
            tier
        );
        await prisma.store.update({
            where: { id: storeId },
            data: { settings: JSON.stringify(updatedSettings) }
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

        const tier = getStorePlanTier(typeof store.settings === 'string' ? JSON.parse(store.settings) : store.settings);
        res.json({ tier, plan: PLATFORM_PLANS[tier] });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch plan summary' });
    }
};

export const createCheckoutSession = async (req: AuthRequest, res: Response) => {
    try {
        const { storeId } = req.params;
        const userId = req.user?.userId;
        const { tier } = updatePlanSchema.parse(req.body);

        if (!isPlanTier(tier)) {
            return res.status(400).json({ error: 'Invalid plan tier' });
        }

        const store = await prisma.store.findUnique({
            where: { id: storeId },
            include: { owner: true }
        });

        if (!store) {
            return res.status(404).json({ error: 'Store not found' });
        }

        if (!canManageStorePlan(store.ownerId, userId, req.user?.role)) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const plan = PLATFORM_PLANS[tier];
        // Note: In a real app, you'd map our tier to a Stripe Price ID
        const stripePriceId = process.env[`STRIPE_PRICE_ID_${tier.toUpperCase()}`];
        
        if (!stripePriceId) {
            // Fallback for demo: use a test price id if available or return error
            return res.status(400).json({ error: 'Stripe Price ID not configured for this tier' });
        }

        // 1. Ensure customer exists in Stripe (simplified)
        let stripeCustomerId = (store.owner as any).stripeCustomerId;
        if (!stripeCustomerId) {
            const customer = await createStripeCustomer(store.owner.email || '', store.owner.name || '');
            stripeCustomerId = customer.id;
            // Update user with stripeCustomerId
            await prisma.user.update({
                where: { id: store.ownerId },
                data: { stripeCustomerId } as any
            });
        }

        const successUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard/stores/${storeId}/billing?success=true`;
        const cancelUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard/stores/${storeId}/billing?canceled=true`;

        const session = await createStripeSession(
            stripeCustomerId,
            stripePriceId,
            successUrl,
            cancelUrl,
            { storeId, tier, userId: userId || '' }
        );

        res.json({ url: session.url });
    } catch (error) {
        console.error('Checkout session error:', error);
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
};
