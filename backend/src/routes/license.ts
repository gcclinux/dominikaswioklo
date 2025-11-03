import express from 'express';
import { generateLicenseKey, validateLicenseKey, getLicenseInfo } from '../config/license';
import { ApiResponse } from '../types';
import { authenticateAdmin } from '../middleware/auth';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

const router = express.Router();

// GET /api/license - Get license info - PUBLIC (needed for frontend branding)
router.get('/', async (req, res) => {
  try {
    const info = getLicenseInfo();
    const authHeader = req.headers.authorization;
    let isAuthenticated = false;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      try {
        // Verify token using the same secret as middleware
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
        isPremium: info.isPremium,
        isValid: info.isValid,
        name: isAuthenticated ? (info.name || null) : null,
        email: isAuthenticated ? (info.email || null) : null,
        licenseKey: isAuthenticated ? (info.licenseKey || null) : null
      } 
    });
  } catch (error) {
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

    // Update license.ts file
    const licensePath = path.join(__dirname, '../config/license.ts');
    let content = fs.readFileSync(licensePath, 'utf8');
    
    // Replace license configuration
    content = content.replace(/const IS_PREMIUM = false;/, 'const IS_PREMIUM = true;');
    content = content.replace(/const LICENSE_KEY = '';/, `const LICENSE_KEY = '${licenseKey}';`);
    content = content.replace(/const LICENSE_NAME = '';/, `const LICENSE_NAME = '${name}';`);
    content = content.replace(/const LICENSE_EMAIL = '';/, `const LICENSE_EMAIL = '${email}';`);
    
    fs.writeFileSync(licensePath, content, 'utf8');

    res.json({ 
      success: true, 
      message: 'Premium license activated! Please restart the server for changes to take effect.',
      data: { name, email }
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

export default router;
