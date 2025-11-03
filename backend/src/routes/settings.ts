import express from 'express';
import { DatabaseQueries } from '../database';
import { ApiResponse } from '../types';
import { getLicenseConfig } from '../config/license';
import { authenticateAdmin } from '../middleware/auth';

const router = express.Router();

// GET /api/settings - Get current settings - PUBLIC (needed for calendar display)
router.get('/', async (req, res) => {
  try {
    const settings = await DatabaseQueries.getSettings();
    const license = getLicenseConfig();
    
    const response: ApiResponse = {
      success: true,
      data: { ...settings, license },
      message: 'Settings retrieved successfully'
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch settings',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /api/settings - Update settings - PROTECTED
router.put('/', authenticateAdmin, async (req, res) => {
  try {
    const updates = req.body;
    
    // Validate that we have valid settings to update
  const validFields = ['maxApp', 'maxAppWeek', 'startHour', 'endHour', 'displayAvailability', 'availabilityLocked', 'availabilityLockedUntil', 'headerMessage', 'pastAppointmentsDays', 'futureAppointmentsDays', 'includeWeekend', 'allow30Min'];
    const filteredUpdates = Object.keys(updates)
      .filter(key => validFields.includes(key))
      .reduce((obj: any, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});
    
    if (Object.keys(filteredUpdates).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid settings provided. Valid fields: maxApp, maxAppWeek'
      });
    }
    
    // Validate numeric fields
    for (const [key, value] of Object.entries(filteredUpdates)) {
      if (['maxApp', 'maxAppWeek', 'startHour', 'endHour', 'displayAvailability', 'availabilityLocked', 'pastAppointmentsDays', 'futureAppointmentsDays', 'includeWeekend', 'allow30Min'].includes(key)) {
        if (!Number.isInteger(value) || (value as number) < 0) {
          return res.status(400).json({
            success: false,
            error: `${key} must be a non-negative integer`
          });
        }
      }
    }

    // Boolean-like fields: availabilityLocked, includeWeekend, allow30Min must be 0 or 1 if provided
    const boolFields: string[] = ['availabilityLocked', 'includeWeekend', 'allow30Min'];
    for (const k of boolFields) {
      const v = (filteredUpdates as any)[k];
      if (v !== undefined && ![0, 1].includes(Number(v))) {
        return res.status(400).json({ success: false, error: `${k} must be 0 or 1` });
      }
    }

    // Validate past/future appointments days set to allowed presets if provided (7, 14, 30, 90)
    const allowed = [7, 14, 30, 90];
    if (filteredUpdates.pastAppointmentsDays !== undefined && !allowed.includes(filteredUpdates.pastAppointmentsDays as number)) {
      return res.status(400).json({ success: false, error: 'pastAppointmentsDays must be one of 7, 14, 30, or 90' });
    }
    if (filteredUpdates.futureAppointmentsDays !== undefined && !allowed.includes(filteredUpdates.futureAppointmentsDays as number)) {
      return res.status(400).json({ success: false, error: 'futureAppointmentsDays must be one of 7, 14, 30, or 90' });
    }

    // headerMessage validation (if provided)
    if (filteredUpdates.headerMessage !== undefined) {
      const msg = filteredUpdates.headerMessage as any;
      if (typeof msg !== 'string') return res.status(400).json({ success: false, error: 'headerMessage must be a string' });
      if (msg.length > 200) return res.status(400).json({ success: false, error: 'headerMessage must be 200 characters or less' });
    }

    // Validate displayAvailability reasonable range (1-52 weeks)
    if (filteredUpdates.displayAvailability !== undefined) {
      const v = filteredUpdates.displayAvailability as number;
      if (v < 1 || v > 52) return res.status(400).json({ success: false, error: 'displayAvailability must be between 1 and 52' });
    }

    // Additional validation for hours if provided
    if (filteredUpdates.startHour !== undefined && (filteredUpdates.startHour < 0 || filteredUpdates.startHour > 23)) {
      return res.status(400).json({ success: false, error: 'startHour must be between 0 and 23' });
    }
    if (filteredUpdates.endHour !== undefined && (filteredUpdates.endHour < 0 || filteredUpdates.endHour > 23)) {
      return res.status(400).json({ success: false, error: 'endHour must be between 0 and 23' });
    }
    if (filteredUpdates.startHour !== undefined && filteredUpdates.endHour !== undefined) {
      if ((filteredUpdates.startHour as number) >= (filteredUpdates.endHour as number)) {
        return res.status(400).json({ success: false, error: 'startHour must be less than endHour' });
      }
    }

    // availabilityLockedUntil if provided must be a valid ISO date string or null
    if (filteredUpdates.availabilityLockedUntil !== undefined) {
      const v = filteredUpdates.availabilityLockedUntil as any;
      if (v !== null) {
        const date = new Date(v);
        if (isNaN(date.getTime())) {
          return res.status(400).json({ success: false, error: 'availabilityLockedUntil must be a valid date string or null' });
        }
      }
    }
    
    await DatabaseQueries.updateSettings(filteredUpdates);
    
    const response: ApiResponse = {
      success: true,
      message: 'Settings updated successfully'
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update settings',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;