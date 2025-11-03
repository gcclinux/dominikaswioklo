// Loader + bootstrapper for license configuration.
// Exposes helpers and an ensure function to create default license files.
/* eslint-disable @typescript-eslint/no-var-requires */

import fs from 'fs';
import path from 'path';

type LicenseModule = {
  generateLicenseKey: (name: string, email: string) => string;
  validateLicenseKey: (name: string, email: string, key: string) => boolean;
  getLicenseInfo: () => { isPremium: boolean; isValid: boolean; name?: string; email?: string };
  getLicenseConfig: () => any;
  isPremiumLicense: () => boolean;
};

export function ensureDefaultLicense(): void {
  try {
    const dir = path.join(__dirname);
    // Dev (ts-node)
    const tsExample = path.join(dir, 'license.example.ts');
    const tsLicense = path.join(dir, 'license.ts');
    if (!fs.existsSync(tsLicense) && fs.existsSync(tsExample)) {
      fs.copyFileSync(tsExample, tsLicense);
      console.log('✅ Created default config/license.ts from license.example.ts');
    }
    // Prod (compiled JS)
    const jsExample = path.join(dir, 'license.example.js');
    const jsLicense = path.join(dir, 'license.js');
    if (!fs.existsSync(jsLicense) && fs.existsSync(jsExample)) {
      fs.copyFileSync(jsExample, jsLicense);
      console.log('✅ Created default config/license.js from license.example.js');
    }
  } catch (e) {
    console.warn('⚠️  Could not ensure default license file:', e instanceof Error ? e.message : e);
  }
}

function loadLicenseModule(): LicenseModule {
  try {
    const realMod = require('./license');
    return realMod as LicenseModule;
  } catch {
    const exampleMod = require('./license.example');
    return exampleMod as LicenseModule;
  }
}

const mod = loadLicenseModule();

export const generateLicenseKey = mod.generateLicenseKey;
export const validateLicenseKey = mod.validateLicenseKey;
export const getLicenseInfo = mod.getLicenseInfo;
export const getLicenseConfig = mod.getLicenseConfig;
export const isPremiumLicense = mod.isPremiumLicense;
