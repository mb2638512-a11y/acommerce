import * as crypto from 'crypto';
import * as QRCode from 'qrcode';

// TOTP Configuration
const TOTP_ISSUER = 'ACommerce';
const TOTP_PERIOD = 30;
const TOTP_DIGITS = 6;
const BACKUP_CODES_COUNT = 10;

/**
 * Generate a random secret for TOTP
 */
export const generateSecret = (): string => {
 return crypto.randomBytes(20).toString('hex');
};

/**
 * Generate TOTP URI for QR code
 */
export const generateTotpUri = (secret: string, email: string): string => {
 const label = encodeURIComponent(`${TOTP_ISSUER}:${email}`);
 return `otpauth://totp/${label}?secret=${secret}&issuer=${TOTP_ISSUER}&algorithm=SHA1&digits=${TOTP_DIGITS}&period=${TOTP_PERIOD}`;
};

/**
 * Generate QR code as data URL
 */
export const generateQrCode = async (totpUri: string): Promise<string> => {
 try {
  return await QRCode.toDataURL(totpUri, {
   width: 200,
   margin: 2,
   color: {
    dark: '#000000',
    light: '#ffffff'
   }
  });
 } catch (error) {
  console.error('Error generating QR code:', error);
  throw new Error('Failed to generate QR code');
 }
};

/**
 * Verify TOTP code
 */
export const verifyTotpCode = (secret: string, code: string): boolean => {
 const expected = generateCurrentTotp(secret);
 return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(code));
};

/**
 * Generate current TOTP code
 */
const generateCurrentTotp = (secret: string): string => {
 const counter = Math.floor(Date.now() / 1000 / TOTP_PERIOD);
 return generateHotp(secret, counter);
};

/**
 * Generate HOTP (HMAC-based One-Time Password)
 */
const generateHotp = (secret: string, counter: number): string => {
 const buffer = Buffer.alloc(8);
 buffer.writeBigInt64BE(BigInt(counter), 0);

 const key = crypto.createHash('sha1').update(secret).digest();
 const hmac = crypto.createHmac('sha1', key);
 hmac.update(buffer);

 const hash = hmac.digest();
 const offset = hash[hash.length - 1] & 0x0f;

 const truncatedHash =
  ((hash[offset] & 0x7f) << 24) |
  ((hash[offset + 1] & 0xff) << 16) |
  ((hash[offset + 2] & 0xff) << 8) |
  (hash[offset + 3] & 0xff);

 const otp = truncatedHash % Math.pow(10, TOTP_DIGITS);
 return otp.toString().padStart(TOTP_DIGITS, '0');
};

/**
 * Generate backup codes for account recovery
 */
export const generateBackupCodes = (): string[] => {
 const codes: string[] = [];
 for (let i = 0; i < BACKUP_CODES_COUNT; i++) {
  // Generate 8-character alphanumeric codes
  const code = crypto.randomBytes(4).toString('hex').toUpperCase();
  codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
 }
 return codes;
};

/**
 * Hash backup code for storage (use bcrypt-like approach with scrypt)
 */
export const hashBackupCode = (code: string): string => {
 const salt = crypto.randomBytes(16).toString('hex');
 const hash = crypto.scryptSync(code.replace('-', ''), salt, 64);
 return `${salt}:${hash.toString('hex')}`;
};

/**
 * Verify backup code
 */
export const verifyBackupCode = (storedHash: string, code: string): boolean => {
 try {
  const [salt, hash] = storedHash.split(':');
  const derivedHash = crypto.scryptSync(code.replace('-', ''), salt, 64);
  return crypto.timingSafeEqual(
   Buffer.from(hash, 'hex'),
   derivedHash
  );
 } catch {
  return false;
 }
};

/**
 * Generate 2FA setup data (secret + QR code)
 */
export const generateTwoFactorSetup = async (email: string): Promise<{
 secret: string;
 qrCode: string;
 backupCodes: string[];
}> => {
 const secret = generateSecret();
 const totpUri = generateTotpUri(secret, email);
 const qrCode = await generateQrCode(totpUri);
 const backupCodes = generateBackupCodes();

 return {
  secret,
  qrCode,
  backupCodes
 };
};

/**
 * Enable 2FA for a user
 */
export const enableTwoFactor = async (
 userId: string,
 secret: string,
 backupCodes: string[]
): Promise<void> => {
 const prisma = await import('../utils/prisma');
 const defaultPrisma = prisma.default;

 // Hash backup codes before storing
 const hashedBackupCodes = backupCodes.map(code => hashBackupCode(code));

 await defaultPrisma.user.update({
  where: { id: userId },
  data: {
   twoFactorEnabled: true,
   twoFactorSecret: secret,
   twoFactorBackupCodes: JSON.stringify(hashedBackupCodes)
  }
 });
};

/**
 * Disable 2FA for a user
 */
export const disableTwoFactor = async (userId: string): Promise<void> => {
 const prisma = await import('../utils/prisma');
 const defaultPrisma = prisma.default;

 await defaultPrisma.user.update({
  where: { id: userId },
  data: {
   twoFactorEnabled: false,
   twoFactorSecret: null,
   twoFactorBackupCodes: null
  }
 });
};

/**
 * Verify 2FA code or backup code
 */
export const verifyTwoFactor = async (
 userId: string,
 code: string
): Promise<{ valid: boolean; isBackupCode?: boolean }> => {
 const prisma = await import('../utils/prisma');
 const defaultPrisma = prisma.default;

 const user = await defaultPrisma.user.findUnique({
  where: { id: userId },
  select: {
   twoFactorEnabled: true,
   twoFactorSecret: true,
   twoFactorBackupCodes: true
  }
 });

 if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
  return { valid: false };
 }

 // First, try TOTP code
 if (verifyTotpCode(user.twoFactorSecret, code)) {
  return { valid: true };
 }

 // Then, try backup codes
 if (user.twoFactorBackupCodes) {
  const backupCodes = JSON.parse(user.twoFactorBackupCodes) as string[];
  for (const hashedCode of backupCodes) {
   if (verifyBackupCode(hashedCode, code)) {
    // Remove used backup code
    const remainingCodes = backupCodes.filter(c => c !== hashedCode);
    await defaultPrisma.user.update({
     where: { id: userId },
     data: {
      twoFactorBackupCodes: JSON.stringify(remainingCodes)
     }
    });
    return { valid: true, isBackupCode: true };
   }
  }
 }

 return { valid: false };
};

/**
 * Get 2FA status for a user
 */
export const getTwoFactorStatus = async (userId: string): Promise<{
 enabled: boolean;
 backupCodesCount: number;
}> => {
 const prisma = await import('../utils/prisma');
 const defaultPrisma = prisma.default;

 const user = await defaultPrisma.user.findUnique({
  where: { id: userId },
  select: {
   twoFactorEnabled: true,
   twoFactorBackupCodes: true
  }
 });

 if (!user || !user.twoFactorEnabled || !user.twoFactorBackupCodes) {
  return { enabled: false, backupCodesCount: 0 };
 }

 const backupCodes = JSON.parse(user.twoFactorBackupCodes) as string[];
 return {
  enabled: true,
  backupCodesCount: backupCodes.length
 };
};
