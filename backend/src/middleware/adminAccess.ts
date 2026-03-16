import { Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { env } from '../config/env';
import { AuthRequest } from './auth';

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

export const requireSecretAdminEmail = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { email: true }
        });

        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (normalizeEmail(user.email) !== env.adminDashboardEmail) {
            return res.status(403).json({ error: 'Admin dashboard access denied' });
        }

        return next();
    } catch (error) {
        return res.status(500).json({ error: 'Failed to verify admin access' });
    }
};
