import express from 'express';
import { login, register, updateProfile, verifyAccount, googleAuth, submitKyc, verifyPayment } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/verify', authenticate, verifyAccount);
router.post('/kyc', authenticate, submitKyc);
router.post('/payment', authenticate, verifyPayment);
router.patch('/profile', authenticate, updateProfile);

export default router;
