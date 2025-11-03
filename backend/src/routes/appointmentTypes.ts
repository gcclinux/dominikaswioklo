import express from 'express';
import { DatabaseQueries } from '../database';
import { ApiResponse } from '../types';
import { authenticateAdmin } from '../middleware/auth';

const router = express.Router();

// GET /api/appointment-types - Get all appointment types - PUBLIC
router.get('/', async (req, res) => {
  try {
    const language = req.query.language as string | undefined;
    const types = await DatabaseQueries.getAppointmentTypes(language);
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

// POST /api/appointment-types - Create appointment type - PROTECTED
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const type = req.body;
    
    if (!type.appName) {
      return res.status(400).json({
        success: false,
        error: 'appName is required'
      });
    }
    
    // Auto-generate appTag from appName if not provided
    if (!type.appTag) {
      type.appTag = type.appName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    
    const atid = await DatabaseQueries.createAppointmentType(type);
    
    res.json({
      success: true,
      data: { atid },
      message: 'Appointment type created successfully'
    });
  } catch (error) {
    console.error('Error creating appointment type:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create appointment type',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /api/appointment-types/:id - Update appointment type - PROTECTED
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const atid = parseInt(req.params.id);
    const type = req.body;
    
    if (!type.appName) {
      return res.status(400).json({
        success: false,
        error: 'appName is required'
      });
    }
    
    // Auto-generate appTag from appName if not provided
    if (!type.appTag) {
      type.appTag = type.appName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    
    await DatabaseQueries.updateAppointmentType(atid, type);
    
    res.json({
      success: true,
      message: 'Appointment type updated successfully'
    });
  } catch (error) {
    console.error('Error updating appointment type:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update appointment type',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// DELETE /api/appointment-types/:id - Delete appointment type - PROTECTED
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const atid = parseInt(req.params.id);
    
    await DatabaseQueries.deleteAppointmentType(atid);
    
    res.json({
      success: true,
      message: 'Appointment type deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting appointment type:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete appointment type',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /api/appointment-types - Update currency - PROTECTED
router.put('/', authenticateAdmin, async (req, res) => {
  try {
    const { currency } = req.body;
    
    if (currency) {
      await DatabaseQueries.updateSettings({ appointmentCurrency: currency });
    }
    
    const response: ApiResponse = {
      success: true,
      message: 'Currency updated successfully'
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error updating currency:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update currency',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
