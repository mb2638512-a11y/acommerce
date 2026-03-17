import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

export const saveSearch = async (req: AuthRequest, res: Response) => {
    try {
        const { query } = req.body;
        const userId = req.user?.userId;

        if (!query || typeof query !== 'string') {
            return res.status(400).json({ error: 'Query is required' });
        }

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Save search history
        const search = await prisma.searchHistory.create({
            data: {
                userId,
                query: query.trim()
            }
        });

        // Optimization: Keep only last 10-20 searches per user
        const searchCount = await prisma.searchHistory.count({ where: { userId } });
        if (searchCount > 20) {
            const oldest = await prisma.searchHistory.findFirst({
                where: { userId },
                orderBy: { createdAt: 'asc' }
            });
            if (oldest) {
                await prisma.searchHistory.delete({ where: { id: oldest.id } });
            }
        }

        res.status(201).json(search);
    } catch (error) {
        console.error('Save search error:', error);
        res.status(500).json({ error: 'Failed to save search history' });
    }
};

export const getSearchHistory = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const history = await prisma.searchHistory.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        res.json(history);
    } catch (error) {
        console.error('Get search history error:', error);
        res.status(500).json({ error: 'Failed to fetch search history' });
    }
};

export const clearSearchHistory = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        await prisma.searchHistory.deleteMany({
            where: { userId }
        });

        res.status(204).send();
    } catch (error) {
        console.error('Clear search history error:', error);
        res.status(500).json({ error: 'Failed to clear search history' });
    }
};
