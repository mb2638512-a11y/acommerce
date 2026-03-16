import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

export const getStoreCustomers = async (req: AuthRequest, res: Response) => {
    try {
        const { storeId } = req.params;
        const userId = req.user?.userId;

        const store = await prisma.store.findUnique({ where: { id: storeId } });
        if (!store || store.ownerId !== userId) return res.status(403).json({ error: 'Unauthorized' });

        const customers = await prisma.customer.findMany({
            where: { storeId },
            orderBy: { lastOrderDate: 'desc' },
            include: { orders: { select: { id: true, date: true, total: true } } }
        });

        res.json(customers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch customers' });
    }
};

export const getCustomerByEmail = async (req: AuthRequest, res: Response) => {
    try {
        const { storeId } = req.params;
        const { email } = req.query;
        const userId = req.user?.userId;
        const role = req.user?.role;

        if (typeof email !== 'string') return res.status(400).json({ error: 'Email required' });
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const store = await prisma.store.findUnique({ where: { id: storeId }, select: { ownerId: true } });
        if (!store) return res.status(404).json({ error: 'Store not found' });
        if (role !== 'admin' && store.ownerId !== userId) return res.status(403).json({ error: 'Forbidden' });

        const customer = await prisma.customer.findFirst({
            where: { storeId, email: email.toLowerCase() }
        });

        res.json(customer);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch customer' });
    }
};
