import express from 'express';
import { DatabaseQueries } from '../database';
import { ApiResponse } from '../types';
import { validateLicenseKey } from '../config/license';
import { authenticateAdmin } from '../middleware/auth';
import db from '../database/init';

// Helper to check if premium license is active
const isPremiumLicense = (): Promise<boolean> => {
  return new Promise((resolve) => {
    db.get('SELECT * FROM app_license WHERE id = 1', (err, row: any) => {
      if (err || !row || !row.isPremium) return resolve(false);
      if (!row.licenseKey || !row.licenseName || !row.licenseEmail) return resolve(false);
      resolve(validateLicenseKey(row.licenseName, row.licenseEmail, row.licenseKey));
    });
  });
};

const router = express.Router();

// GET /api/email-settings - Get email settings - PROTECTED
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const settings = await DatabaseQueries.getEmailSettings();
    
    // Return settings without exposing password
    const safeSettings = {
      smtpHost: settings.smtpHost,
      smtpPort: settings.smtpPort,
      smtpSecure: settings.smtpSecure,
      smtpUser: settings.smtpUser,
      smtpFrom: settings.smtpFrom,
      emailFooter: settings.emailFooter,
      smtpPass: settings.smtpPass ? '********' : '',
      updatedAt: settings.updatedAt
    };
    
    const response: ApiResponse = {
      success: true,
      data: safeSettings
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching email settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch email settings',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /api/email-settings - Update email settings - PROTECTED
router.put('/', authenticateAdmin, async (req, res) => {
  const hasPremium = await isPremiumLicense();
  if (!hasPremium) {
    return res.status(403).json({
      success: false,
      error: 'Email configuration is a premium feature'
    });
  }
  
  try {
    const updates: any = {};
    
    if (req.body.smtpHost !== undefined) updates.smtpHost = req.body.smtpHost;
    if (req.body.smtpPort !== undefined) updates.smtpPort = parseInt(req.body.smtpPort);
    if (req.body.smtpSecure !== undefined) updates.smtpSecure = req.body.smtpSecure ? 1 : 0;
    if (req.body.smtpUser !== undefined) updates.smtpUser = req.body.smtpUser;
    if (req.body.smtpFrom !== undefined) updates.smtpFrom = req.body.smtpFrom;
    if (req.body.emailFooter !== undefined) updates.emailFooter = req.body.emailFooter;
    
    // Only update password if provided and not masked
    if (req.body.smtpPass && req.body.smtpPass !== '********') {
      updates.smtpPass = req.body.smtpPass;
    }
    
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      });
    }
    
    await DatabaseQueries.updateEmailSettings(updates);
    
    const response: ApiResponse = {
      success: true,
      message: 'Email settings updated successfully'
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error updating email settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update email settings',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
