// Loader for license configuration.
// License state is now stored in the database, this just exports the validation functions.

import { generateLicenseKey, validateLicenseKey, getLicenseConfig } from './license.example';

// No longer needed - license is stored in database
export function ensureDefaultLicense(): void {
  // No-op: license state is now in the database
}

export { generateLicenseKey, validateLicenseKey, getLicenseConfig };
