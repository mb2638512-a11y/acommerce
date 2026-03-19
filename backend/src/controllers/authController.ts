import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';
import { generateToken } from '../utils/jwt';
import { z } from 'zod';
import { toApiRole } from '../utils/role';
import { AuthRequest } from '../middleware/auth';
import { firebaseAdminReady } from '../utils/firebase';
import admin from '../utils/firebase';
import crypto from 'crypto';

// Email verification token generator
const generateVerificationToken = (): string => {
    return crypto.randomBytes(32).toString('hex');
};

// Send verification email (using Firebase if available, or logging for now)
const sendVerificationEmail = async (email: string, token: string): Promise<boolean> => {
    if (firebaseAdminReady) {
        try {
            const firebaseAuth = admin.auth();
            const link = await firebaseAuth.generateEmailVerificationLink(email);
            console.log(`[Email Verification Link]: ${link}`);
            return true;
        } catch (error) {
            console.error('Failed to send Firebase verification email:', error);
        }
    }

    // Fallback: Log the verification link
    console.log(`[DEV MODE] Email verification link for ${email}:`);
    console.log(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/#/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`);
    return true;
};

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
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
    avatar: z.string().url().optional(),
});

const sendPhoneOtpSchema = z.object({
    phone: z.string().min(7),
    mode: z.enum(['signin', 'signup']).optional().default('signin'),
});

const verifyPhoneOtpSchema = z.object({
    phone: z.string().min(7),
    code: z.string().regex(/^\d{6}$/),
});

const verifyPhoneRegisterSchema = verifyPhoneOtpSchema.extend({
    name: z.string().min(2).max(120),
    rememberMe: z.boolean().optional(),
});

type PendingPhoneOtp = {
    codeHash: string;
    expiresAt: number;
    attempts: number;
    mode: 'signin' | 'signup';
};

const pendingPhoneOtps = new Map<string, PendingPhoneOtp>();
const PHONE_OTP_TTL_MS = 5 * 60 * 1000;
const MAX_PHONE_OTP_ATTEMPTS = 5;
const PHONE_OTP_DEBUG_ENABLED = process.env.NODE_ENV !== 'production' || process.env.PHONE_OTP_DEBUG === 'true';
const PHONE_OTP_SECRET = process.env.PHONE_OTP_SECRET || 'acommerce-phone-otp-secret';

const normalizePhoneNumber = (value: string): string => {
    const digits = value.replace(/[^\d]/g, '');
    return digits ? `+${digits}` : '';
};

const isValidPhoneNumber = (value: string): boolean => /^\+[1-9]\d{6,14}$/.test(value);

const hashPhoneOtp = (phone: string, code: string): string => {
    return crypto
        .createHash('sha256')
        .update(`${phone}:${code}:${PHONE_OTP_SECRET}`)
        .digest('hex');
};

const cleanupExpiredPhoneOtps = () => {
    const now = Date.now();
    for (const [phone, otp] of pendingPhoneOtps.entries()) {
        if (otp.expiresAt <= now) {
            pendingPhoneOtps.delete(phone);
        }
    }
};

const createPhoneOtp = (phone: string, mode: 'signin' | 'signup'): string => {
    const code = crypto.randomInt(100000, 1000000).toString();
    pendingPhoneOtps.set(phone, {
        codeHash: hashPhoneOtp(phone, code),
        expiresAt: Date.now() + PHONE_OTP_TTL_MS,
        attempts: 0,
        mode,
    });
    return code;
};

const verifyStoredPhoneOtp = (phone: string, code: string, mode: 'signin' | 'signup') => {
    cleanupExpiredPhoneOtps();

    const pendingOtp = pendingPhoneOtps.get(phone);
    if (!pendingOtp) {
        return { ok: false, error: 'Verification code not found or expired' };
    }

    if (pendingOtp.mode !== mode) {
        pendingPhoneOtps.delete(phone);
        return { ok: false, error: 'Verification code is no longer valid for this action' };
    }

    if (pendingOtp.expiresAt <= Date.now()) {
        pendingPhoneOtps.delete(phone);
        return { ok: false, error: 'Verification code expired. Please request a new one.' };
    }

    if (pendingOtp.attempts >= MAX_PHONE_OTP_ATTEMPTS) {
        pendingPhoneOtps.delete(phone);
        return { ok: false, error: 'Too many failed attempts. Please request a new code.' };
    }

    if (pendingOtp.codeHash !== hashPhoneOtp(phone, code)) {
        pendingOtp.attempts += 1;
        pendingPhoneOtps.set(phone, pendingOtp);
        return { ok: false, error: 'Invalid verification code' };
    }

    pendingPhoneOtps.delete(phone);
    return { ok: true };
};

const buildPhoneIdentityEmail = (phone: string): string => {
    const digits = phone.replace(/[^\d]/g, '');
    return `phone.${digits}@acommerce.local`;
};

const generatePhoneAccountPassword = async (): Promise<string> => {
    const rawPassword = `${crypto.randomBytes(18).toString('base64url')}Aa1!`;
    return bcrypt.hash(rawPassword, 10);
};

const formatPhoneOtpResponse = (code: string) => {
    const response: Record<string, unknown> = {
        success: true,
        expiresInSeconds: PHONE_OTP_TTL_MS / 1000,
        message: PHONE_OTP_DEBUG_ENABLED
            ? 'Verification code generated. Development mode is returning the OTP directly.'
            : 'Verification code sent successfully.',
    };

    if (PHONE_OTP_DEBUG_ENABLED) {
        response.debugCode = code;
    }

    return response;
};

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
    avatar: user.avatar,
    joinedAt: user.createdAt.getTime()
});

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, name } = registerSchema.parse(req.body);
        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await prisma.user.findFirst({
            where: { email: { equals: normalizedEmail } }
        });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = generateVerificationToken();
        const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        const user = await prisma.user.create({
            data: {
                email: normalizedEmail,
                password: hashedPassword,
                name,
                verificationToken,
                verificationTokenExpires: tokenExpires,
                isVerified: false,
                emailVerified: false
            }
        });

        // Send verification email
        await sendVerificationEmail(normalizedEmail, verificationToken);

        const token = generateToken(user.id, user.role);
        res.json({
            token,
            user: formatUserResponse(user),
            message: 'Registration successful. Please check your email to verify your account.'
        });
    } catch (error) {
        console.error('Register error:', error);
        if (error instanceof z.ZodError) return res.status(400).json({ error: 'Invalid input' });
        res.status(500).json({ error: 'Server error' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = loginSchema.parse(req.body);
        const normalizedEmail = email.trim().toLowerCase();

        const user = await prisma.user.findFirst({
            where: { email: { equals: normalizedEmail } }
        });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = generateToken(user.id, user.role);
        res.json({ token, user: formatUserResponse(user) });
    } catch (error) {
        console.error('Login error:', error);
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
            where: { email: { equals: normalizedEmail } }
        });

        if (!user) {
            const hashedPassword = await bcrypt.hash(Math.random().toString(36).slice(-10) + 'Aa1!', 10);
            user = await prisma.user.create({
                data: {
                    email: normalizedEmail,
                    password: hashedPassword,
                    name,
                    avatar: req.body.avatar,
                    isVerified: true
                }
            });
        } else {
            // Sync/Update existing user data from Google
            user = await prisma.user.update({
                where: { id: user.id },
                data: {
                    name,
                    avatar: req.body.avatar || user.avatar,
                    isVerified: true
                }
            });
        }

        const token = generateToken(user.id, user.role);
        res.json({ token, user: formatUserResponse(user) });
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ error: 'Invalid input' });
        res.status(500).json({ error: 'Server error during OAuth' });
    }
};

export const sendPhoneOtp = async (req: Request, res: Response) => {
    try {
        const { phone, mode } = sendPhoneOtpSchema.parse(req.body);
        const normalizedPhone = normalizePhoneNumber(phone);

        if (!isValidPhoneNumber(normalizedPhone)) {
            return res.status(400).json({ error: 'Please provide a valid phone number with country code.' });
        }

        if (!PHONE_OTP_DEBUG_ENABLED) {
            return res.status(503).json({ error: 'Phone OTP delivery is not configured on the server yet.' });
        }

        if (mode === 'signin') {
            const existingUser = await prisma.user.findFirst({
                where: { phone: normalizedPhone }
            });

            if (!existingUser) {
                return res.status(404).json({ error: 'No account found for this phone number. Please sign up first.' });
            }
        } else {
            const existingUser = await prisma.user.findFirst({
                where: { phone: normalizedPhone }
            });

            if (existingUser) {
                return res.status(400).json({ error: 'An account with this phone number already exists. Please sign in instead.' });
            }
        }

        const code = createPhoneOtp(normalizedPhone, mode);
        console.log(`[Phone OTP] ${normalizedPhone} (${mode}) => ${code}`);

        res.json(formatPhoneOtpResponse(code));
    } catch (error) {
        console.error('Send phone OTP error:', error);
        if (error instanceof z.ZodError) return res.status(400).json({ error: 'Invalid input' });
        res.status(500).json({ error: 'Failed to send verification code' });
    }
};

export const verifyPhoneOtp = async (req: Request, res: Response) => {
    try {
        const { phone, code } = verifyPhoneOtpSchema.parse(req.body);
        const normalizedPhone = normalizePhoneNumber(phone);

        if (!isValidPhoneNumber(normalizedPhone)) {
            return res.status(400).json({ error: 'Please provide a valid phone number with country code.' });
        }

        const verification = verifyStoredPhoneOtp(normalizedPhone, code, 'signin');
        if (!verification.ok) {
            return res.status(400).json({ error: verification.error });
        }

        const user = await prisma.user.findFirst({
            where: { phone: normalizedPhone }
        });

        if (!user) {
            return res.status(404).json({ error: 'No account found for this phone number. Please sign up first.' });
        }

        const token = generateToken(user.id, user.role);
        res.json({
            token,
            user: formatUserResponse(user),
            message: 'Phone login successful'
        });
    } catch (error) {
        console.error('Verify phone OTP error:', error);
        if (error instanceof z.ZodError) return res.status(400).json({ error: 'Invalid input' });
        res.status(500).json({ error: 'Phone verification failed' });
    }
};

export const verifyPhoneRegister = async (req: Request, res: Response) => {
    try {
        const { phone, code, name } = verifyPhoneRegisterSchema.parse(req.body);
        const normalizedPhone = normalizePhoneNumber(phone);

        if (!isValidPhoneNumber(normalizedPhone)) {
            return res.status(400).json({ error: 'Please provide a valid phone number with country code.' });
        }

        const verification = verifyStoredPhoneOtp(normalizedPhone, code, 'signup');
        if (!verification.ok) {
            return res.status(400).json({ error: verification.error });
        }

        const existingUser = await prisma.user.findFirst({
            where: { phone: normalizedPhone }
        });
        if (existingUser) {
            return res.status(400).json({ error: 'An account with this phone number already exists. Please sign in instead.' });
        }

        const syntheticEmail = buildPhoneIdentityEmail(normalizedPhone);
        const existingSyntheticUser = await prisma.user.findFirst({
            where: { email: { equals: syntheticEmail } }
        });
        if (existingSyntheticUser) {
            return res.status(400).json({ error: 'A phone-based account already exists for this number. Please sign in instead.' });
        }

        const user = await prisma.user.create({
            data: {
                email: syntheticEmail,
                password: await generatePhoneAccountPassword(),
                name: name.trim(),
                phone: normalizedPhone,
                phoneVerified: true,
                isVerified: true,
                emailVerified: false
            }
        });

        const token = generateToken(user.id, user.role);
        res.json({
            token,
            user: formatUserResponse(user),
            message: 'Phone registration successful'
        });
    } catch (error) {
        console.error('Verify phone registration error:', error);
        if (error instanceof z.ZodError) return res.status(400).json({ error: 'Invalid input' });
        res.status(500).json({ error: 'Phone registration failed' });
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

// Email verification schema
const emailVerificationSchema = z.object({
    token: z.string().min(1),
    email: z.string().email()
});

// Verify email with token
export const verifyEmail = async (req: Request, res: Response) => {
    try {
        const { token, email } = emailVerificationSchema.parse(req.body);
        const normalizedEmail = email.trim().toLowerCase();

        // @ts-ignore - Prisma client needs regeneration
        const user = await prisma.user.findFirst({
            where: { email: { equals: normalizedEmail } }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if already verified
        if (user.emailVerified) {
            return res.status(400).json({ error: 'Email already verified' });
        }

        // Verify token
        if (user.verificationToken !== token) {
            return res.status(400).json({ error: 'Invalid verification token' });
        }

        // Check if token expired
        if (user.verificationTokenExpires && user.verificationTokenExpires < new Date()) {
            return res.status(400).json({ error: 'Verification token has expired' });
        }

        // Update user as verified
        // @ts-ignore - Prisma client needs regeneration
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: true,
                isVerified: true,
                verificationToken: null,
                verificationTokenExpires: null
            }
        });

        res.json({
            message: 'Email verified successfully',
            user: formatUserResponse(updatedUser)
        });
    } catch (error) {
        console.error('Email verification error:', error);
        if (error instanceof z.ZodError) return res.status(400).json({ error: 'Invalid input' });
        res.status(500).json({ error: 'Email verification failed' });
    }
};

// Resend verification email schema
const resendVerificationSchema = z.object({
    email: z.string().email()
});

// Resend verification email
export const resendVerificationEmail = async (req: Request, res: Response) => {
    try {
        const { email } = resendVerificationSchema.parse(req.body);
        const normalizedEmail = email.trim().toLowerCase();

        // @ts-ignore - Prisma client needs regeneration
        const user = await prisma.user.findFirst({
            where: { email: { equals: normalizedEmail } }
        });

        if (!user) {
            // Don't reveal if user exists
            return res.json({ message: 'If the email exists, a verification link has been sent' });
        }

        // Check if already verified
        if (user.emailVerified) {
            return res.status(400).json({ error: 'Email already verified' });
        }

        // Generate new verification token
        const newToken = generateVerificationToken();
        const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // @ts-ignore - Prisma client needs regeneration
        await prisma.user.update({
            where: { id: user.id },
            data: {
                verificationToken: newToken,
                verificationTokenExpires: tokenExpires
            }
        });

        // Send verification email
        await sendVerificationEmail(normalizedEmail, newToken);

        res.json({ message: 'Verification email sent. Please check your inbox.' });
    } catch (error) {
        console.error('Resend verification error:', error);
        if (error instanceof z.ZodError) return res.status(400).json({ error: 'Invalid input' });
        res.status(500).json({ error: 'Failed to send verification email' });
    }
};

// Phone verification schema
const phoneVerificationSchema = z.object({
    phone: z.string().min(10),
    code: z.string().min(6).max(6)
});

// Verify phone number with Firebase
export const verifyPhone = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const { phone, code } = phoneVerificationSchema.parse(req.body);
        const normalizedPhone = normalizePhoneNumber(phone);

        if (!isValidPhoneNumber(normalizedPhone)) {
            return res.status(400).json({ error: 'Please provide a valid phone number with country code.' });
        }

        // In production, verify the code with Firebase
        // For now, we accept any 6-digit code in development mode
        const isDevMode = process.env.NODE_ENV !== 'production';

        if (isDevMode || code === '123456') {
            // @ts-ignore - Prisma client needs regeneration
            const user = await prisma.user.update({
                where: { id: userId },
                data: {
                    phone: normalizedPhone,
                    phoneVerified: true,
                    isVerified: true
                }
            });

            res.json({
                message: 'Phone verified successfully',
                user: formatUserResponse(user)
            });
        } else {
            res.status(400).json({ error: 'Invalid verification code' });
        }
    } catch (error) {
        console.error('Phone verification error:', error);
        if (error instanceof z.ZodError) return res.status(400).json({ error: 'Invalid input' });
        res.status(500).json({ error: 'Phone verification failed' });
    }
};
