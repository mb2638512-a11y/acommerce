import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { auth as firebaseAuth, firebaseAdminReady } from '../utils/firebase';
import { supabase } from '../utils/supabase';

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        role: 'admin' | 'user';
        email?: string;
    };
}

const USE_FIREBASE = process.env.USE_FIREBASE === 'true' || process.env.VITE_USE_FIREBASE === 'true';
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_acommerce_key_change_in_prod';

// JWT-only verification fallback (used when Firebase Admin SDK is not initialized)
const verifyWithJWT = (token: string): { userId: string; role: 'admin' | 'user' } | null => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        return {
            userId: decoded.userId || decoded.id || decoded.sub,
            role: decoded.role || 'user'
        };
    } catch {
        return null;
    }
};

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    try {
        if (USE_FIREBASE && firebaseAdminReady && firebaseAuth) {
            // Firebase Admin SDK is available — verify Firebase ID token
            const decodedToken = await (firebaseAuth as any).verifyIdToken(token);
            req.user = {
                userId: decodedToken.uid,
                role: decodedToken.admin ? 'admin' : 'user',
                email: decodedToken.email
            };
        } else if (USE_FIREBASE && !firebaseAdminReady) {
            // Firebase mode but Admin SDK not available — fall back to JWT
            const decoded = verifyWithJWT(token);
            if (!decoded) return res.status(401).json({ error: 'Invalid token (JWT fallback)' });
            req.user = { userId: decoded.userId, role: decoded.role };
        } else {
            // Supabase mode
            const { data: { user }, error } = await supabase.auth.getUser(token);
            if (error || !user) throw error || new Error('Supabase Auth failed');
            
            req.user = {
                userId: user.id,
                role: (user.app_metadata?.role as any) || 'user',
                email: user.email
            };
        }
        next();
    } catch (error) {
        console.error('Backend Auth: Token verification failed', error);
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
        if (USE_FIREBASE && firebaseAdminReady && firebaseAuth) {
            const decodedToken = await (firebaseAuth as any).verifyIdToken(token);
            req.user = {
                userId: decodedToken.uid,
                role: decodedToken.admin ? 'admin' : 'user',
                email: decodedToken.email
            };
        } else if (USE_FIREBASE && !firebaseAdminReady) {
            const decoded = verifyWithJWT(token);
            if (decoded) {
                req.user = { userId: decoded.userId, role: decoded.role };
            }
        } else {
            const { data: { user }, error } = await supabase.auth.getUser(token);
            if (!error && user) {
                req.user = {
                    userId: user.id,
                    role: (user.app_metadata?.role as any) || 'user',
                    email: user.email
                };
            }
        }
    } catch (error) {
        console.warn('Backend Auth Optional: Token verification failed', error);
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

