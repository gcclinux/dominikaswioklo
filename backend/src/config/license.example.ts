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

// Premium license configuration
const IS_PREMIUM = false;
const LICENSE_KEY = '';
const LICENSE_NAME = '';
const LICENSE_EMAIL = '';

// Secret key for license generation (keep this private!)
const LICENSE_SECRET = '78090092f200960d38cf461d1025f56c8155d63ac5d4eed0c6839a5c5245d7e0';

// Generate license key from name and email
export const generateLicenseKey = (name: string, email: string): string => {
  const data = `${name.toLowerCase().trim()}:${email.toLowerCase().trim()}:${LICENSE_SECRET}`;
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 32).toUpperCase();
};

// Validate license key
export const validateLicenseKey = (name: string, email: string, key: string): boolean => {
  const expectedKey = generateLicenseKey(name, email);
  return key.toUpperCase() === expectedKey;
};

// Check if current license is valid
const isLicenseValid = (): boolean => {
  if (!IS_PREMIUM || !LICENSE_KEY || !LICENSE_NAME || !LICENSE_EMAIL) {
    return false;
  }
  return validateLicenseKey(LICENSE_NAME, LICENSE_EMAIL, LICENSE_KEY);
};

export const getLicenseConfig = (): LicenseConfig => {
  const isPremium = IS_PREMIUM && isLicenseValid();
  return {
    isPremium,
    features: {
      removeBranding: !isPremium,
      emailNotifications: isPremium,
      emailFooterBranding: !isPremium,
    },
  };
};

export const isPremiumLicense = (): boolean => {
  return IS_PREMIUM && isLicenseValid();
};

export const getLicenseInfo = () => {
  return {
    isPremium: IS_PREMIUM,
    isValid: isLicenseValid(),
    name: LICENSE_NAME,
    email: LICENSE_EMAIL
  };
};
