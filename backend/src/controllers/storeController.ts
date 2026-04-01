import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';
import { getStorePlanTier, withDefaultSubscription } from '../utils/storePlan';
import { getStoreFeatures as fetchStoreFeatures, getStorePlanTierById, formatFeaturesForResponse, getAvailableFeatures, getUnavailableFeatures } from '../utils/featureCheck';
import { PLATFORM_PLANS, PlanTier, getFeaturesForPlan } from '../config/platformPlans';

const createStoreSchema = z.object({
    name: z.string().min(2),
    description: z.string().optional(),
    slug: z.string().optional(),
    themeColor: z.string().optional(),
    settings: z.record(z.any()).optional()
});

const normalizeStore = <T extends { settings: unknown }>(store: T) => {
    const planTier = getStorePlanTier(store.settings);
    return {
        ...store,
        planTier
    };
};

const buildUniqueSlug = async (baseName: string, preferredSlug?: string) => {
    const rawBase = preferredSlug || baseName;
    const normalized = rawBase.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const slugBase = normalized || `store-${Date.now()}`;
    let slug = slugBase;
    let attempt = 1;

    while (true) {
        const existing = await prisma.store.findUnique({ where: { slug } });
        if (!existing) return slug;
        slug = `${slugBase}-${attempt++}`;
    }
};

export const createStore = async (req: AuthRequest, res: Response) => {
    try {
        const { name, description, slug, themeColor, settings } = createStoreSchema.parse(req.body);
        const userId = req.user?.userId;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true }
        });

        const storeCount = await prisma.store.count({
            where: { ownerId: userId }
        });

        const maxStoresMap: Record<string, number> = {
            admin: 999,
            seller: 5,
            customer: 1
        };

        const maxStores = maxStoresMap[user?.role || 'customer'];

        if (storeCount >= maxStores) {
            return res.status(403).json({
                error: 'Store limit reached',
                message: `You can only create up to ${maxStores} store(s). You've already created ${storeCount} store(s).`,
                upgradeUrl: '/pricing',
                currentCount: storeCount,
                limit: maxStores
            });
        }

        const finalSlug = await buildUniqueSlug(name, slug);

        const defaultSettings = {
            shippingFee: 0,
            taxRate: 0,
            currency: 'USD',
            maintenanceMode: false,
            freeShippingThreshold: 100,
            salesGoal: 1000,
            font: 'sans',
            borderRadius: 'md',
            logoUrl: '',
            bannerUrl: '',
            announcementBar: '',
            socialLinks: {},
            subscription: { tier: 'STARTER', status: 'ACTIVE' }
        };

        const mergedSettings = {
            ...defaultSettings,
            ...(typeof settings === 'object' ? settings : {})
        };

        const store = await prisma.store.create({
            data: {
                name,
                slug: finalSlug,
                description: description || '',
                themeColor: themeColor || 'indigo',
                ownerId: userId,
                settings: JSON.stringify(mergedSettings)
            }
        });

        res.status(201).json(normalizeStore(store));
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors[0]?.message || 'Invalid input' });
        }
        console.error('Create store error:', error);
        res.status(500).json({ error: 'Failed to create store' });
    }
};

export const getMyStores = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const stores = await prisma.store.findMany({
            where: { ownerId: userId },
            include: {
                products: { select: { id: true, name: true, price: true, images: true } }
            }
        });

        res.json(stores.map(normalizeStore));
    } catch (error) {
        console.error('Get my stores error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

export const getStores = async (req: Request, res: Response) => {
    try {
        const stores = await prisma.store.findMany({
            include: {
                products: {
                    include: {
                        orderItems: {
                            select: { quantity: true }
                        }
                    }
                }
            }
        });

        const storesWithSales = stores.map((store) => {
            const productsWithSales = store.products.map(product => {
                const salesCount = product.orderItems.reduce((sum, item) => sum + item.quantity, 0);
                const { orderItems, ...productWithoutOrderItems } = product;
                return {
                    ...productWithoutOrderItems,
                    salesCount
                };
            });
            return {
                ...store,
                products: productsWithSales
            };
        });

        res.json(storesWithSales.map(normalizeStore));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stores' });
    }
};

export const getStoreById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const store = await prisma.store.findFirst({
            where: {
                OR: [{ id }, { slug: id }]
            },
            include: {
                products: true
            }
        });

        if (!store) {
            return res.status(404).json({ error: 'Store not found' });
        }

        res.json(normalizeStore(store));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch store' });
    }
};

export const getStoreAdminDetails = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const store = await prisma.store.findFirst({
            where: {
                id,
                ownerId: userId
            },
            include: {
                products: true,
                orders: { include: { items: true, customer: true } },
                customers: true,
                discounts: true,
                blogPosts: true,
                pages: true,
                activityLog: true,
                messages: true,
                chatSessions: { include: { messages: true } },
                subscribers: true
            }
        });

        if (!store) {
            return res.status(404).json({ error: 'Store not found or unauthorized' });
        }

        res.json(normalizeStore(store));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch store details' });
    }
};

export const inviteStaff = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { email } = req.body;
        const userId = req.user?.userId;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const store = await prisma.store.findFirst({
            where: { id, ownerId: userId }
        });

        if (!store) return res.status(404).json({ error: 'Store not found or unauthorized' });
        if (!email) return res.status(400).json({ error: 'Email is required' });

        await prisma.subscriber.create({
            data: { storeId: id, email }
        });

        res.json({ message: 'Invite sent successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send invite' });
    }
};

// Get store features - returns available features for the authenticated store
export const getStoreFeatures = async (req: AuthRequest, res: Response) => {
    try {
        const { storeId } = req.params;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Verify the user owns or has access to this store
        const store = await prisma.store.findFirst({
            where: {
                id: storeId,
                ownerId: userId
            },
            select: { id: true, settings: true, name: true }
        });

        if (!store) {
            return res.status(404).json({ error: 'Store not found or unauthorized' });
        }

        const planTier = getStorePlanTier(store.settings);
        const features = fetchStoreFeaturesById(store.settings);
        const availableFeatures = await getAvailableFeatures(storeId);
        const unavailableFeatures = await getUnavailableFeatures(storeId);

        if (!features) {
            return res.status(500).json({ error: 'Failed to retrieve features' });
        }

        const formattedFeatures = formatFeaturesForResponse(features);

        res.json({
            storeId: store.id,
            storeName: store.name,
            plan: {
                tier: planTier,
                label: PLATFORM_PLANS[planTier].label,
                monthlyPrice: PLATFORM_PLANS[planTier].monthlyPriceUsd
            },
            features: formattedFeatures,
            availableFeatures,
            unavailableFeatures,
            allFeatures: {
                ...features
            }
        });
    } catch (error) {
        console.error('Error fetching store features:', error);
        res.status(500).json({ error: 'Failed to fetch store features' });
    }
};

// Get store features from store settings (helper function)
const fetchStoreFeaturesById = (storeSettings: unknown) => {
    try {
        const planTier = getStorePlanTier(storeSettings);
        return getFeaturesForPlan(planTier);
    } catch (error) {
        console.error('Error fetching store features:', error);
        return null;
    }
};
