import express from 'express';
import { DatabaseQueries } from '../database';
import { ApiResponse } from '../types';
import { authenticateAdmin } from '../middleware/auth';

const router = express.Router();

// GET /api/about - Get all about sections - PUBLIC
router.get('/', async (req, res) => {
  try {
    const sections = await DatabaseQueries.getAboutSections();
    
    const response: ApiResponse = {
      success: true,
      data: sections,
      message: `Found ${sections.length} about sections`
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching about sections:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch about sections',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/about/:language - Get about sections by language - PUBLIC
router.get('/:language', async (req, res) => {
  try {
    const { language } = req.params;
    
    if (!['en', 'pl', 'default'].includes(language)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid language. Supported: en, pl, default'
      });
    }
    
    const sections = await DatabaseQueries.getAboutSectionsByLanguage(language);
    
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
      message: `Found ${sections.length} about sections for ${language}`
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching about sections by language:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch about sections',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /api/about - Create or update about section - PROTECTED
router.put('/', authenticateAdmin, async (req, res) => {
  try {
    const { sectionKey, language, title, body } = req.body;
    
    if (!sectionKey || !language) {
      return res.status(400).json({
        success: false,
        error: 'sectionKey and language are required'
      });
    }
    
    if (!['en', 'pl', 'default'].includes(language)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid language. Supported: en, pl, default'
      });
    }
    
    const validSections = ['header', 'intro', 'approach', 'expertise', 'personal'];
    if (!validSections.includes(sectionKey)) {
      return res.status(400).json({
        success: false,
        error: `Invalid sectionKey. Supported: ${validSections.join(', ')}`
      });
    }
    
    await DatabaseQueries.upsertAboutSection({
      sectionKey,
      language,
      title: title || '',
      body: body || ''
    });
    
    res.json({
      success: true,
      message: `About section '${sectionKey}' for '${language}' saved successfully`
    });
  } catch (error) {
    console.error('Error saving about section:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save about section',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /api/about/bulk - Bulk update multiple sections - PROTECTED
router.put('/bulk', authenticateAdmin, async (req, res) => {
  try {
    const { sections } = req.body;
    
    if (!Array.isArray(sections) || sections.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'sections array is required'
      });
    }
    
    const validSections = ['header', 'intro', 'approach', 'expertise', 'personal'];
    const validLanguages = ['en', 'pl', 'default'];
    
    for (const section of sections) {
      if (!section.sectionKey || !section.language) {
        return res.status(400).json({
          success: false,
          error: 'Each section must have sectionKey and language'
        });
      }
      
      if (!validLanguages.includes(section.language)) {
        return res.status(400).json({
          success: false,
          error: `Invalid language '${section.language}'. Supported: ${validLanguages.join(', ')}`
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
      await DatabaseQueries.upsertAboutSection({
        sectionKey: section.sectionKey,
        language: section.language,
        title: section.title || '',
        body: section.body || ''
      });
    }
    
    res.json({
      success: true,
      message: `Saved ${sections.length} about sections successfully`
    });
  } catch (error) {
    console.error('Error bulk saving about sections:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save about sections',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// DELETE /api/about/:id - Delete about section - PROTECTED
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid section ID'
      });
    }
    
    await DatabaseQueries.deleteAboutSection(id);
    
    res.json({
      success: true,
      message: 'About section deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting about section:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete about section',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
