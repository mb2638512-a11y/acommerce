import { NextFunction, Request, Response } from 'express';

type Bucket = {
    count: number;
    resetAt: number;
};

const buckets = new Map<string, Bucket>();

type RateLimitOptions = {
    keyPrefix: string;
    max: number;
    windowMs: number;
};

const getClientKey = (req: Request) => {
    const forwardedFor = req.headers['x-forwarded-for'];
    if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
        return forwardedFor.split(',')[0].trim();
    }
    return req.ip || req.socket.remoteAddress || 'unknown';
};

export const rateLimit = (options: RateLimitOptions) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const now = Date.now();
        const key = `${options.keyPrefix}:${getClientKey(req)}`;
        const existing = buckets.get(key);

        if (!existing || now > existing.resetAt) {
            buckets.set(key, { count: 1, resetAt: now + options.windowMs });
            return next();
        }

        if (existing.count >= options.max) {
            const retryAfter = Math.ceil((existing.resetAt - now) / 1000);
            res.setHeader('Retry-After', retryAfter.toString());
            return res.status(429).json({ error: 'Too many requests' });
        }

        existing.count += 1;
        next();
    };
};
