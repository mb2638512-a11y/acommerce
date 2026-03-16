import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';
import { generateToken } from '../utils/jwt';
import { z } from 'zod';
import { toApiRole } from '../utils/role';
import { AuthRequest } from '../middleware/auth';

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(2),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

const updateProfileSchema = z.object({
    name: z.string().min(2).max(120)
});

const verifySchema = z.object({
    phone: z.string().min(5),
    companyName: z.string().min(2),
});

const kycSchema = z.object({
    legalName: z.string().min(2),
    dateOfBirth: z.string(),
    idDocumentUrl: z.string().url()
});

const verifyPaymentSchema = z.object({
    provider: z.enum(['STRIPE', 'PAYPAL']),
    paymentId: z.string().min(5)
});

const googleAuthSchema = z.object({
    email: z.string().email(),
    name: z.string().min(2),
});

const formatUserResponse = (user: any) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    role: toApiRole(user.role),
    isVerified: user.isVerified || false,
    kycStatus: user.kycStatus,
    paymentVerified: user.paymentVerified || false,
    stripeCustomerId: user.stripeCustomerId,
    paypalPayerId: user.paypalPayerId,
    joinedAt: user.createdAt.getTime()
});

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, name } = registerSchema.parse(req.body);
        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await prisma.user.findFirst({
            where: { email: { equals: normalizedEmail, mode: 'insensitive' } }
        });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { email: normalizedEmail, password: hashedPassword, name }
        });

        const token = generateToken(user.id, user.role);
        res.json({ token, user: formatUserResponse(user) });
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ error: 'Invalid input' });
        res.status(500).json({ error: 'Server error' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = loginSchema.parse(req.body);
        const normalizedEmail = email.trim().toLowerCase();

        const user = await prisma.user.findFirst({
            where: { email: { equals: normalizedEmail, mode: 'insensitive' } }
        });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = generateToken(user.id, user.role);
        res.json({ token, user: formatUserResponse(user) });
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ error: 'Invalid input' });
        res.status(500).json({ error: 'Server error' });
    }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });
        const { name } = updateProfileSchema.parse(req.body);

        const user = await prisma.user.update({
            where: { id: userId },
            data: { name }
        });

        res.json(formatUserResponse(user));
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ error: 'Invalid input' });
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

export const verifyAccount = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const { phone, companyName } = verifySchema.parse(req.body);

        const user = await prisma.user.update({
            where: { id: userId },
            data: { isVerified: true, phone, companyName }
        });

        res.json({ user: formatUserResponse(user) });
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ error: 'Invalid input' });
        res.status(500).json({ error: 'Failed to verify account' });
    }
};

export const googleAuth = async (req: Request, res: Response) => {
    try {
        const { email, name } = googleAuthSchema.parse(req.body);
        const normalizedEmail = email.trim().toLowerCase();

        let user = await prisma.user.findFirst({
            where: { email: { equals: normalizedEmail, mode: 'insensitive' } }
        });

        if (!user) {
            const hashedPassword = await bcrypt.hash(Math.random().toString(36).slice(-10) + 'Aa1!', 10);
            user = await prisma.user.create({
                data: { email: normalizedEmail, password: hashedPassword, name, isVerified: false }
            });
        }

        const token = generateToken(user.id, user.role);
        res.json({ token, user: formatUserResponse(user) });
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ error: 'Invalid input' });
        res.status(500).json({ error: 'Server error during OAuth' });
    }
};

export const submitKyc = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const { legalName, dateOfBirth, idDocumentUrl } = kycSchema.parse(req.body);

        const user = await prisma.user.update({
            where: { id: userId },
            data: { kycStatus: 'APPROVED', idDocumentUrl }
        });

        res.json({ user: formatUserResponse(user) });
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ error: 'Invalid input' });
        res.status(500).json({ error: 'Failed to submit KYC' });
    }
};

export const verifyPayment = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const { provider, paymentId } = verifyPaymentSchema.parse(req.body);

        const updateData: any = { paymentVerified: true };
        if (provider === 'STRIPE') {
            updateData.stripeCustomerId = paymentId;
        } else if (provider === 'PAYPAL') {
            updateData.paypalPayerId = paymentId;
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: updateData
        });

        res.json({ user: formatUserResponse(user) });
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ error: 'Invalid input' });
        res.status(500).json({ error: 'Failed to verify payment method' });
    }
};
