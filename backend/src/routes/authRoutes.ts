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
  verifyPhoneRegister,
  setupTwoFactor,
  verifyTwoFactorEnable,
  disableTwoFactorController,
  loginWithTwoFactor,
  getTwoFactorStatusController,
  requestPasswordReset,
  confirmPasswordReset
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

// Password reset (JWT mode)
router.post('/password-reset', requestPasswordReset);
router.post('/password-reset/confirm', confirmPasswordReset);

// Two-Factor Authentication routes
router.post('/2fa/setup', authenticate, setupTwoFactor);
router.post('/2fa/verify', authenticate, verifyTwoFactorEnable);
router.post('/2fa/disable', authenticate, disableTwoFactorController);
router.post('/2fa/login', loginWithTwoFactor);
router.get('/2fa/status', authenticate, getTwoFactorStatusController);

export default router;
