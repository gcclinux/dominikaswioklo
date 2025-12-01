import crypto from 'crypto';

// License configuration for Free vs Premium tiers
export interface LicenseConfig {
  isPremium: boolean;
  features: {
    removeBranding: boolean;
    emailNotifications: boolean;
    emailFooterBranding: boolean;
  };
}

// Secret key for license generation (keep this private!)
const LICENSE_SECRET = '78090092f200960d38cf461d1025f56c8155d63ac5d4eed0c6839a5c5245d7e0';
const PREMIUM_FEATURES_ENCRYPTION = process.env.PREMIUM_FEATURES_ENCRYPTION || 'easyscheduler-has-additional-key';

// Generate license key from name and email
export const generateLicenseKey = (name: string, email: string): string => {
  const data = `${name.toLowerCase().trim()}:${email.toLowerCase().trim()}:${LICENSE_SECRET}:${PREMIUM_FEATURES_ENCRYPTION}`;
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 32).toUpperCase();
};

// Validate license key
export const validateLicenseKey = (name: string, email: string, key: string): boolean => {
  const expectedKey = generateLicenseKey(name, email);
  return key.toUpperCase() === expectedKey;
};

// Get license config based on premium status (called with DB value)
export const getLicenseConfig = (isPremium: boolean): LicenseConfig => {
  return {
    isPremium,
    features: {
      removeBranding: !isPremium,
      emailNotifications: isPremium,
      emailFooterBranding: !isPremium,
    },
  };
};
