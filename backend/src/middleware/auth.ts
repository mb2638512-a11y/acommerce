import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { toApiRole } from '../utils/role';

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        role: 'admin' | 'user';
    };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const payload = verifyToken(token);
        req.user = {
            userId: payload.userId,
            role: toApiRole(payload.role)
        };
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

export const authenticateOptional = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next();
    }

    const token = authHeader.split(' ')[1];
    try {
        const payload = verifyToken(token);
        req.user = {
            userId: payload.userId,
            role: toApiRole(payload.role)
        };
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }

    next();
};

export const authorize = (roles: Array<'admin' | 'user'>) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        next();
    };
};
