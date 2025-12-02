import express from 'express';
import { generateLicenseKey, validateLicenseKey } from '../config/license.example';
import { authenticateAdmin } from '../middleware/auth';
import jwt from 'jsonwebtoken';
import db from '../database/init';

const router = express.Router();

// Helper to get license from database
const getDbLicense = (): Promise<{ isPremium: boolean; licenseKey: string; licenseName: string; licenseEmail: string } | null> => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM app_license WHERE id = 1', (err, row: any) => {
      if (err) return reject(err);
      if (!row) return resolve(null);
      resolve({
        isPremium: row.isPremium === 1,
        licenseKey: row.licenseKey || '',
        licenseName: row.licenseName || '',
        licenseEmail: row.licenseEmail || ''
      });
    });
  });
};

// Helper to update license in database
const updateDbLicense = (isPremium: boolean, name: string, email: string, licenseKey: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE app_license SET isPremium = ?, licenseName = ?, licenseEmail = ?, licenseKey = ?, activatedAt = CURRENT_TIMESTAMP, updatedAt = CURRENT_TIMESTAMP WHERE id = 1`,
      [isPremium ? 1 : 0, name, email, licenseKey],
      (err) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
};

// GET /api/license - Get license info - PUBLIC (needed for frontend branding)
router.get('/', async (req, res) => {
  try {
    const dbLicense = await getDbLicense();
    
    // Check if license is valid
    let isValid = false;
    if (dbLicense && dbLicense.isPremium && dbLicense.licenseKey && dbLicense.licenseName && dbLicense.licenseEmail) {
      isValid = validateLicenseKey(dbLicense.licenseName, dbLicense.licenseEmail, dbLicense.licenseKey);
    }
    
    const authHeader = req.headers.authorization;
    let isAuthenticated = false;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      try {
        const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
        jwt.verify(token, JWT_SECRET);
        isAuthenticated = true;
      } catch {
        isAuthenticated = false;
      }
    }
    
    res.json({ 
      success: true, 
      data: { 
        isPremium: dbLicense?.isPremium && isValid,
        isValid,
        name: isAuthenticated ? (dbLicense?.licenseName || null) : null,
        email: isAuthenticated ? (dbLicense?.licenseEmail || null) : null,
        licenseKey: isAuthenticated ? (dbLicense?.licenseKey || null) : null
      } 
    });
  } catch (error) {
    console.error('Error getting license:', error);
    res.status(500).json({ success: false, error: 'Failed to get license info' });
  }
});

// POST /api/license/activate - Activate premium license - PROTECTED
router.post('/activate', authenticateAdmin, async (req, res) => {
  try {
    const { name, email, licenseKey } = req.body;
    
    if (!name || !email || !licenseKey) {
      return res.status(400).json({ success: false, error: 'Name, email, and license key are required' });
    }

    // Validate license key
    const isValid = validateLicenseKey(name, email, licenseKey);
    
    if (!isValid) {
      return res.status(400).json({ success: false, error: 'Invalid license key' });
    }

    // Store license in database
    await updateDbLicense(true, name, email, licenseKey);

    res.json({ 
      success: true, 
      message: 'Premium license activated successfully!',
      data: { name, email, isPremium: true }
    });
  } catch (error) {
    console.error('Error activating license:', error);
    res.status(500).json({ success: false, error: 'Failed to activate license' });
  }
});

// POST /api/license/generate - Generate license key - PROTECTED
router.post('/generate', authenticateAdmin, async (req, res) => {
  try {
    const { name, email } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ success: false, error: 'Name and email are required' });
    }

    const licenseKey = generateLicenseKey(name, email);
    
    res.json({ 
      success: true, 
      data: { 
        name, 
        email, 
        licenseKey 
      } 
    });
  } catch (error) {
    console.error('Error generating license:', error);
    res.status(500).json({ success: false, error: 'Failed to generate license' });
  }
});

// POST /api/license/deactivate - Deactivate license - PROTECTED
router.post('/deactivate', authenticateAdmin, async (req, res) => {
  try {
    await updateDbLicense(false, '', '', '');
    res.json({ success: true, message: 'License deactivated' });
  } catch (error) {
    console.error('Error deactivating license:', error);
    res.status(500).json({ success: false, error: 'Failed to deactivate license' });
  }
});

export default router;
