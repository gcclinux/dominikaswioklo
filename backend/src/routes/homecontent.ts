import express from 'express';
import { DatabaseQueries } from '../database';
import { ApiResponse } from '../types';
import { authenticateAdmin } from '../middleware/auth';

const router = express.Router();

// GET /api/homecontent - Get all home sections - PUBLIC
router.get('/', async (req, res) => {
  try {
    const sections = await DatabaseQueries.getHomeSections();
    
    // Transform array into object keyed by sectionKey for easier frontend consumption
    const sectionsMap: Record<string, { title: string; body: string }> = {};
    sections.forEach((section: any) => {
      sectionsMap[section.sectionKey] = {
        title: section.title,
        body: section.body
      };
    });
    
    const response: ApiResponse = {
      success: true,
      data: sectionsMap,
      message: `Found ${sections.length} home sections`
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching home sections:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch home sections',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /api/homecontent - Create or update home section - PROTECTED
router.put('/', authenticateAdmin, async (req, res) => {
  try {
    const { sectionKey, title, body } = req.body;
    
    if (!sectionKey) {
      return res.status(400).json({
        success: false,
        error: 'sectionKey is required'
      });
    }
    
    const validSections = ['hero', 'servicesHeading', 'serviceIndividual', 'serviceCouples', 'serviceGroup', 'whyChooseUs'];
    if (!validSections.includes(sectionKey)) {
      return res.status(400).json({
        success: false,
        error: `Invalid sectionKey. Supported: ${validSections.join(', ')}`
      });
    }
    
    await DatabaseQueries.upsertHomeSection({
      sectionKey,
      title: title || '',
      body: body || ''
    });
    
    res.json({
      success: true,
      message: `Home section '${sectionKey}' saved successfully`
    });
  } catch (error) {
    console.error('Error saving home section:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save home section',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /api/homecontent/bulk - Bulk update multiple sections - PROTECTED
router.put('/bulk', authenticateAdmin, async (req, res) => {
  try {
    const { sections } = req.body;
    
    if (!Array.isArray(sections) || sections.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'sections array is required'
      });
    }
    
    const validSections = ['hero', 'servicesHeading', 'serviceIndividual', 'serviceCouples', 'serviceGroup', 'whyChooseUs'];
    
    for (const section of sections) {
      if (!section.sectionKey) {
        return res.status(400).json({
          success: false,
          error: 'Each section must have sectionKey'
        });
      }
      
      if (!validSections.includes(section.sectionKey)) {
        return res.status(400).json({
          success: false,
          error: `Invalid sectionKey '${section.sectionKey}'. Supported: ${validSections.join(', ')}`
        });
      }
    }
    
    // Save all sections
    for (const section of sections) {
      await DatabaseQueries.upsertHomeSection({
        sectionKey: section.sectionKey,
        title: section.title || '',
        body: section.body || ''
      });
    }
    
    res.json({
      success: true,
      message: `Successfully saved ${sections.length} home sections`
    });
  } catch (error) {
    console.error('Error bulk saving home sections:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save home sections',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// DELETE /api/homecontent/:id - Delete a home section - PROTECTED
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid section ID'
      });
    }
    
    await DatabaseQueries.deleteHomeSection(id);
    
    res.json({
      success: true,
      message: 'Home section deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting home section:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete home section',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
