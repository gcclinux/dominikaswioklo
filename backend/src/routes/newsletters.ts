import express from 'express';
import { DatabaseQueries } from '../database';
import { ApiResponse } from '../types';
import { authenticateAdmin } from '../middleware/auth';
import { EmailService } from '../services/emailService';

const router = express.Router();

// GET /api/newsletters - Get all newsletters - PROTECTED
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const newsletters = await DatabaseQueries.getNewsletters();
    const response: ApiResponse = {
      success: true,
      data: newsletters,
      message: 'Newsletters retrieved successfully'
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching newsletters:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch newsletters',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/newsletters/:id - Get single newsletter - PROTECTED
router.get('/:id', authenticateAdmin, async (req, res) => {
  try {
    const newsletter = await DatabaseQueries.getNewsletterById(req.params.id);
    if (!newsletter) {
      return res.status(404).json({
        success: false,
        error: 'Newsletter not found'
      });
    }
    const response: ApiResponse = {
      success: true,
      data: newsletter,
      message: 'Newsletter retrieved successfully'
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching newsletter:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch newsletter',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/newsletters - Create newsletter - PROTECTED
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const { title, subtitle, message_part1, message_part2, status } = req.body;
    
    if (!title || !message_part1) {
      return res.status(400).json({
        success: false,
        error: 'Title and message_part1 are required'
      });
    }

    const adminId = (req as any).admin?.aid;
    const id = await DatabaseQueries.createNewsletter({
      title,
      subtitle,
      message_part1,
      message_part2,
      status: status || 'draft',
      sent_by: adminId
    });

    const response: ApiResponse = {
      success: true,
      data: { id },
      message: 'Newsletter created successfully'
    };
    res.json(response);
  } catch (error) {
    console.error('Error creating newsletter:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create newsletter',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /api/newsletters/:id - Update newsletter - PROTECTED
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { title, subtitle, message_part1, message_part2, status, sent_at } = req.body;
    const updates: any = {};

    if (title !== undefined) updates.title = title;
    if (subtitle !== undefined) updates.subtitle = subtitle;
    if (message_part1 !== undefined) updates.message_part1 = message_part1;
    if (message_part2 !== undefined) updates.message_part2 = message_part2;
    if (status !== undefined) updates.status = status;
    if (sent_at !== undefined) updates.sent_at = sent_at;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      });
    }

    await DatabaseQueries.updateNewsletter(req.params.id, updates);

    const response: ApiResponse = {
      success: true,
      message: 'Newsletter updated successfully'
    };
    res.json(response);
  } catch (error) {
    console.error('Error updating newsletter:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update newsletter',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// DELETE /api/newsletters/:id - Delete newsletter - PROTECTED
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    await DatabaseQueries.deleteNewsletter(req.params.id);
    const response: ApiResponse = {
      success: true,
      message: 'Newsletter deleted successfully'
    };
    res.json(response);
  } catch (error) {
    console.error('Error deleting newsletter:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete newsletter',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/newsletters/send - Send newsletter to all users - PROTECTED
router.post('/send', authenticateAdmin, async (req, res) => {
  try {
    const { title, subtitle, message_part1, message_part2, draftId } = req.body;
    
    if (!title || !message_part1) {
      return res.status(400).json({
        success: false,
        error: 'Title and message_part1 are required'
      });
    }

    const adminId = (req as any).admin?.aid;
    let newsletterId = draftId;

    // If no draft ID, create a new newsletter
    if (!newsletterId) {
      newsletterId = await DatabaseQueries.createNewsletter({
        title,
        subtitle,
        message_part1,
        message_part2,
        status: 'sent',
        sent_by: adminId
      });
    }

    // Get all users
    const users = await DatabaseQueries.getUsers();
    
    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No users found to send newsletter to'
      });
    }

    // Send newsletter to all users
    let sentCount = 0;
    const newsletterData = { title, subtitle, message_part1, message_part2 };

    for (const user of users) {
      try {
        await EmailService.sendNewsletter(user.email, user, newsletterData);
        sentCount++;
      } catch (error) {
        console.error(`Failed to send newsletter to ${user.email}:`, error);
      }
    }

    // Update newsletter status to 'sent' and set sent_at timestamp
    await DatabaseQueries.updateNewsletter(newsletterId.toString(), {
      status: 'sent',
      sent_at: new Date().toISOString()
    });

    const response: ApiResponse = {
      success: true,
      data: { 
        newsletterId, 
        sentCount,
        totalUsers: users.length 
      },
      message: `Newsletter sent to ${sentCount} out of ${users.length} users`
    };
    res.json(response);
  } catch (error) {
    console.error('Error sending newsletter:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send newsletter',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
