import express from 'express';
import { DatabaseQueries } from '../database';
import { ApiResponse } from '../types';
import { authenticateAdmin } from '../middleware/auth';

const router = express.Router();

// POST /api/blocked - Block a user/IP/email - PROTECTED
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const { userId, ipAddress, email, reason } = req.body || {};

    // At least one identifier must be provided
    if (!userId && !ipAddress && !email) {
      return res.status(400).json({
        success: false,
        error: 'Provide at least one of userId, ipAddress, or email to block.'
      });
    }

    let finalIp = ipAddress as string | undefined;
    let resolvedUserId = userId as number | undefined;

  // Determine an email to store: prefer provided email, otherwise resolve from user record
  let finalEmail = email as string | undefined;

    // If userId provided but ip missing, try to resolve ip from user record
    if (!finalIp && resolvedUserId) {
      const user = await DatabaseQueries.getUserById(resolvedUserId);
      if (user?.ipAddress) finalIp = user.ipAddress;
      if (!finalEmail && user?.email) finalEmail = user.email;
    }

    // If still no ip, try resolve by email
    if (!finalIp && email) {
      const userByEmail = await DatabaseQueries.getUserByEmail(email);
      if (userByEmail?.ipAddress) {
        finalIp = userByEmail.ipAddress;
        if (!resolvedUserId && userByEmail.uid) resolvedUserId = userByEmail.uid;
        if (!finalEmail && userByEmail?.email) finalEmail = userByEmail.email;
      }
    }

    // Fallback to 'unknown' to satisfy NOT NULL constraint
    if (!finalIp) finalIp = 'unknown';

    // Prevent blocking localhost/local IPs
    const localIps = ['127.0.0.1', '::1', 'localhost', '::ffff:127.0.0.1', 'unknown'];
    if (localIps.includes(finalIp)) {
      return res.status(400).json({
        success: false,
        error: 'Cannot block localhost or local IP addresses'
      });
    }

    const bid = await DatabaseQueries.addBlocked({
      userId: resolvedUserId || 0,
      ipAddress: finalIp,
      email: finalEmail,
      reason: reason || 'Blocked by admin'
    });

    const response: ApiResponse = {
      success: true,
      data: { bid },
      message: 'Blocked entry created'
    };
    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating blocked entry:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create blocked entry',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/blocked - list blocked entries - PROTECTED
router.get('/', authenticateAdmin, async (req, res) => {
  try {
  const blocked = await (await import('../database')).DatabaseQueries.getBlocked();
    res.json({ success: true, data: blocked });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch blocked list' });
  }
});

// DELETE /api/blocked/:id - remove a blocked entry - PROTECTED
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ success: false, error: 'Invalid id' });
  await (await import('../database')).DatabaseQueries.deleteBlocked(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting blocked entry:', error);
    res.status(500).json({ success: false, error: 'Failed to delete blocked entry' });
  }
});

export default router;
