import express from 'express';
import {
  login,
  register,
  updateProfile,
  verifyAccount,
  googleAuth,
  submitKyc,
  verifyPayment,
  verifyEmail,
  resendVerificationEmail,
  verifyPhone,
  sendPhoneOtp,
  verifyPhoneOtp,
  verifyPhoneRegister
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/send-phone-otp', sendPhoneOtp);
router.post('/verify-phone-otp', verifyPhoneOtp);
router.post('/verify-phone-register', verifyPhoneRegister);
router.post('/verify', authenticate, verifyAccount);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);
router.post('/verify-phone', authenticate, verifyPhone);
router.post('/kyc', authenticate, submitKyc);
router.post('/payment', authenticate, verifyPayment);
router.patch('/profile', authenticate, updateProfile);

export default router;
