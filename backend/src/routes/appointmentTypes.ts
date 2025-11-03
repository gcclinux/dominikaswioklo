import express from 'express';
import { DatabaseQueries } from '../database';
import { ApiResponse } from '../types';
import { authenticateAdmin } from '../middleware/auth';

const router = express.Router();

// GET /api/appointment-types - Get all appointment types - PUBLIC
router.get('/', async (req, res) => {
  try {
    const types = await DatabaseQueries.getAppointmentTypes();
    const settings = await DatabaseQueries.getSettings();
    
    const response: ApiResponse = {
      success: true,
      data: {
        types,
        currency: settings.appointmentCurrency || 'USD'
      },
      message: `Found ${types.length} appointment types`
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching appointment types:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch appointment types',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /api/appointment-types - Update appointment types - PROTECTED
router.put('/', authenticateAdmin, async (req, res) => {
  try {
    const { types, currency } = req.body;
    
    if (!Array.isArray(types)) {
      return res.status(400).json({
        success: false,
        error: 'Types must be an array'
      });
    }
    
    await DatabaseQueries.updateAppointmentTypes(types, currency || 'USD');
    
    if (currency) {
      await DatabaseQueries.updateSettings({ appointmentCurrency: currency });
    }
    
    const response: ApiResponse = {
      success: true,
      message: 'Appointment types updated successfully'
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error updating appointment types:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update appointment types',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
