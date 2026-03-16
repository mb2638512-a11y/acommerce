import { Request, Response } from 'express';
import { Prisma, Role } from '@prisma/client';
import prisma from '../utils/prisma';
import { toApiRole } from '../utils/role';
import { DEFAULT_PLAN_TIER, PLAN_TIERS } from '../config/platformPlans';
import { getStorePlanTier } from '../utils/storePlan';
import { withUpdatedPlanSettings } from '../utils/storePlan';

const toDbRole = (role: Role): Role => (role === 'ADMIN' ? 'USER' : 'ADMIN');

const normalizeStore = <T extends { settings: unknown }>(store: T) => {
    const planTier = getStorePlanTier(store.settings);
    return {
        ...store,
        planTier
    };
};

export const getPlatformStats = async (req: Request, res: Response) => {
    try {
        const [totalUsers, totalStores, totalRevenueResult, totalOrders, stores] = await Promise.all([
            prisma.user.count(),
            prisma.store.count(),
            prisma.order.aggregate({ _sum: { total: true } }),
            prisma.order.count(),
            prisma.store.findMany({ select: { settings: true } })
        ]);

        let activeStores = 0;
        const planDistribution = PLAN_TIERS.reduce((acc, tier) => {
            acc[tier] = 0;
            return acc;
        }, {} as Record<(typeof PLAN_TIERS)[number], number>);

        for (const store of stores) {
            const settings = (store.settings || {}) as Record<string, unknown>;
            const maintenanceMode = settings.maintenanceMode === true;
            if (!maintenanceMode) activeStores += 1;

            const tier = getStorePlanTier(settings) || DEFAULT_PLAN_TIER;
            planDistribution[tier] += 1;
        }

        const premiumStores = (planDistribution.PREMIUM || 0) + (planDistribution.ENTERPRISE || 0);

        res.json({
            totalUsers,
            totalStores,
            activeStores,
            totalRevenue: totalRevenueResult._sum.total || 0,
            totalOrders,
            premiumStores,
            planDistribution,
            systemHealth: 'Healthy'
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
};

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, name: true, email: true, role: true, createdAt: true }
        });

        res.json(
            users.map((user) => ({
                id: user.id,
                name: user.name,
                email: user.email,
                role: toApiRole(user.role),
                joinedAt: user.createdAt.getTime(),
                createdAt: user.createdAt
            }))
        );
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

export const getAllStores = async (req: Request, res: Response) => {
    try {
        const stores = await prisma.store.findMany({
            include: { orders: true, products: true }
        });

        res.json(stores.map(normalizeStore));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stores' });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const targetId = req.params.id;
        const actorId = req.user?.userId;
        if (actorId && actorId === targetId) {
            return res.status(400).json({ error: 'You cannot delete your own account' });
        }

        const target = await prisma.user.findUnique({ where: { id: targetId }, select: { role: true } });
        if (!target) return res.status(404).json({ error: 'User not found' });
        if (target.role === 'ADMIN') {
            const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
            if (adminCount <= 1) {
                return res.status(400).json({ error: 'Cannot delete the last admin user' });
            }
        }

        await prisma.user.delete({ where: { id: targetId } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
};

export const deleteStore = async (req: Request, res: Response) => {
    try {
        await prisma.store.delete({ where: { id: req.params.id } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete store' });
    }
};

export const toggleUserRole = async (req: Request, res: Response) => {
    try {
        const actorId = req.user?.userId;
        const user = await prisma.user.findUnique({ where: { id: req.params.id } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const newRole = toDbRole(user.role);
        if (actorId && actorId === user.id && newRole === 'USER') {
            return res.status(400).json({ error: 'You cannot demote your own admin role' });
        }
        if (user.role === 'ADMIN' && newRole === 'USER') {
            const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
            if (adminCount <= 1) {
                return res.status(400).json({ error: 'Cannot demote the last admin user' });
            }
        }

        await prisma.user.update({
            where: { id: user.id },
            data: { role: newRole }
        });

        res.json({ role: toApiRole(newRole) });
    } catch (error) {
        res.status(500).json({ error: 'Failed to toggle role' });
    }
};

export const getRevenueAnalytics = async (req: Request, res: Response) => {
    try {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            return date.toISOString().split('T')[0];
        });

        const orders = await prisma.order.findMany({
            where: {
                status: { not: 'CANCELLED' },
                date: { gte: new Date(new Date().setDate(new Date().getDate() - 7)) }
            },
            select: { total: true, date: true }
        });

        const data = last7Days.map((dateStr) => {
            const dayTotal = orders
                .filter((order) => order.date.toISOString().startsWith(dateStr))
                .reduce((sum, order) => sum + order.total, 0);
            return { date: dateStr, revenue: dayTotal };
        });

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch revenue analytics' });
    }
};

export const getAllOrders = async (req: Request, res: Response) => {
    try {
        const orders = await prisma.order.findMany({
            include: { store: { select: { name: true } } },
            orderBy: { date: 'desc' },
            take: 100
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};

export const getAllProducts = async (req: Request, res: Response) => {
    try {
        const products = await prisma.product.findMany({
            include: { store: { select: { name: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        await prisma.product.delete({ where: { id: req.params.id } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete product' });
    }
};

export const toggleStoreMaintenance = async (req: Request, res: Response) => {
    try {
        const store = await prisma.store.findUnique({ where: { id: req.params.id } });
        if (!store) return res.status(404).json({ error: 'Store not found' });

        const currentSettings = (store.settings || {}) as Record<string, unknown>;
        const maintenanceMode = currentSettings.maintenanceMode !== true;

        await prisma.store.update({
            where: { id: store.id },
            data: { settings: { ...currentSettings, maintenanceMode } }
        });
        res.json({ maintenanceMode });
    } catch (error) {
        res.status(500).json({ error: 'Failed to toggle maintenance mode' });
    }
};

export const getAudienceInsights = async (req: Request, res: Response) => {
    try {
        const [users, stores, shopperAggregates] = await Promise.all([
            prisma.user.findMany({
                select: { id: true, name: true, email: true, role: true, createdAt: true }
            }),
            prisma.store.findMany({
                include: {
                    orders: { select: { total: true } }
                }
            }),
            prisma.order.groupBy({
                by: ['customerEmail'],
                _count: { _all: true },
                _sum: { total: true }
            })
        ]);

        const sellerMetricsByUserId = new Map<
            string,
            {
                stores: number;
                totalRevenue: number;
                planMix: Record<string, number>;
            }
        >();

        for (const store of stores) {
            const sellerEntry = sellerMetricsByUserId.get(store.ownerId) || {
                stores: 0,
                totalRevenue: 0,
                planMix: { STARTER: 0, PRO: 0, PREMIUM: 0, ENTERPRISE: 0 }
            };
            sellerEntry.stores += 1;
            sellerEntry.totalRevenue += store.orders.reduce((sum, order) => sum + order.total, 0);
            const tier = getStorePlanTier(store.settings) || DEFAULT_PLAN_TIER;
            sellerEntry.planMix[tier] = (sellerEntry.planMix[tier] || 0) + 1;
            sellerMetricsByUserId.set(store.ownerId, sellerEntry);
        }

        const shopperByEmail = new Map(
            shopperAggregates.map((row) => [
                row.customerEmail,
                {
                    orders: row._count._all,
                    spend: row._sum.total || 0
                }
            ])
        );

        const sellers = users
            .filter((user) => sellerMetricsByUserId.has(user.id))
            .map((user) => {
                const metrics = sellerMetricsByUserId.get(user.id)!;
                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: toApiRole(user.role),
                    joinedAt: user.createdAt,
                    stores: metrics.stores,
                    totalRevenue: metrics.totalRevenue,
                    planMix: metrics.planMix
                };
            });

        const shoppers = users.map((user) => {
            const metrics = shopperByEmail.get(user.email) || { orders: 0, spend: 0 };
            return {
                id: user.id,
                name: user.name,
                email: user.email,
                role: toApiRole(user.role),
                joinedAt: user.createdAt,
                orders: metrics.orders,
                spend: metrics.spend,
                isSeller: sellerMetricsByUserId.has(user.id)
            };
        });

        res.json({
            sellers,
            shoppers,
            summary: {
                sellerCount: sellers.length,
                activeShopperCount: shoppers.filter((shopper) => shopper.orders > 0).length,
                highValueShoppers: shoppers.filter((shopper) => shopper.spend >= 1000).length
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch audience insights' });
    }
};

export const updateStorePlanByAdmin = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { tier } = req.body as { tier?: string };

        if (!tier || !PLAN_TIERS.includes(tier as (typeof PLAN_TIERS)[number])) {
            return res.status(400).json({ error: 'Invalid plan tier' });
        }

        const store = await prisma.store.findUnique({
            where: { id },
            select: { id: true, settings: true }
        });

        if (!store) {
            return res.status(404).json({ error: 'Store not found' });
        }

        const settings = withUpdatedPlanSettings(store.settings, tier as (typeof PLAN_TIERS)[number]);

        const updated = await prisma.store.update({
            where: { id },
            data: { settings: settings as Prisma.InputJsonValue }
        });

        res.json(normalizeStore(updated));
    } catch (error) {
        res.status(500).json({ error: 'Failed to update store plan' });
    }
};

export const getSystemLogs = async (req: Request, res: Response) => {
    try {
        const logs = await prisma.platformLog.findMany({
            orderBy: { timestamp: 'desc' },
            take: 100
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch system logs' });
    }
};

export const getApiKeys = async (req: Request, res: Response) => {
    try {
        const keys = await prisma.apiKey.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(keys);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch API keys' });
    }
};

export const createApiKey = async (req: Request, res: Response) => {
    try {
        const { name, permissions } = req.body;
        const key = `sk_${Math.random().toString(36).substring(2, 11)}_${Math.random().toString(36).substring(2, 11)}`;

        const apiKey = await prisma.apiKey.create({
            data: {
                name,
                key,
                permissions: permissions || ['read'],
            }
        });
        res.status(201).json(apiKey);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create API key' });
    }
};

export const deleteApiKey = async (req: Request, res: Response) => {
    try {
        await prisma.apiKey.delete({ where: { id: req.params.id } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete API key' });
    }
};

export const getPlatformSettings = async (req: Request, res: Response) => {
    try {
        const settings = await prisma.globalSetting.findMany();
        const settingsMap = settings.reduce((acc, s) => {
            acc[s.key] = s.value;
            return acc;
        }, {} as Record<string, string>);
        res.json(settingsMap);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
};

export const updatePlatformSettings = async (req: Request, res: Response) => {
    try {
        const settings = req.body as Record<string, string>;

        const updates = Object.entries(settings).map(([key, value]) =>
            prisma.globalSetting.upsert({
                where: { key },
                update: { value },
                create: { key, value }
            })
        );

        await Promise.all(updates);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update settings' });
    }
};
