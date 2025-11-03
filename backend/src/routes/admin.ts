import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { DatabaseQueries } from '../database';
import { ApiResponse } from '../types';
import { EmailService } from '../services/emailService';
import { authenticateAdmin, generateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// GET /api/admins/check - check if any admin exists (public endpoint - no auth)
router.get('/check', async (req, res) => {
  try {
    const admins = await DatabaseQueries.getAdmins();
    res.json({ success: true, data: { hasAdmins: admins.length > 0, count: admins.length } });
  } catch (error) {
    console.error('Error checking admins:', error);
    res.status(500).json({ success: false, error: 'Failed to check admins' });
  }
});

// GET /api/admins - list admins (safe fields) - PROTECTED
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const admins = await DatabaseQueries.getAdmins();
  const safe = admins.map((a: any) => ({
      aid: a.aid,
      aName: a.aName,
      aSurname: a.aSurname,
      email: a.email,
      login: a.login,
      passwordLastChanged: a.passwordLastChanged,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt
    }));
    const response: ApiResponse = { success: true, data: safe, message: `Found ${safe.length} admins` };
    res.json(response);
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch admins', message: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// GET /api/admins/:aid - get admin by id (safe) - PROTECTED
router.get('/:aid', authenticateAdmin, async (req, res) => {
  try {
    const aid = parseInt(req.params.aid, 10);
    if (isNaN(aid)) return res.status(400).json({ success: false, error: 'Invalid admin id' });

    const admin = await DatabaseQueries.getAdminById(aid);
    if (!admin) return res.status(404).json({ success: false, error: 'Admin not found' });

    const safe = { aid: admin.aid, aName: admin.aName, aSurname: admin.aSurname, email: admin.email, login: admin.login, passwordLastChanged: admin.passwordLastChanged, createdAt: admin.createdAt, updatedAt: admin.updatedAt };
    res.json({ success: true, data: safe });
  } catch (error) {
    console.error('Error fetching admin by id:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch admin', message: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// POST /api/admins - create new admin
// Allow first admin creation without auth, subsequent admins require auth
router.post('/', async (req, res) => {
  try {
    const { aName, aSurname, email, login, password } = req.body;
    if (!aName || !aSurname || !email || !login || !password) return res.status(400).json({ success: false, error: 'Missing required fields' });

    // Check if this is the first admin
    const existingAdmins = await DatabaseQueries.getAdmins();
    const isFirstAdmin = existingAdmins.length === 0;

    // If not the first admin, require authentication
    if (!isFirstAdmin) {
      const token = (req as any).headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production') as { aid: number; login: string };
        (req as any).admin = decoded;
      } catch (error) {
        return res.status(401).json({
          success: false,
          error: 'Invalid or expired token'
        });
      }
    }

    // validate login uniqueness
    const existing = await DatabaseQueries.getAdminByLogin(login);
    if (existing) return res.status(409).json({ success: false, error: 'Login already in use' });

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const aid = await DatabaseQueries.createAdmin({ aName, aSurname, email, login, password: hashed });

    res.status(201).json({ success: true, data: { aid }, message: 'Admin created' });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ success: false, error: 'Failed to create admin', message: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// PUT /api/admins/:aid - update admin (partial) - PROTECTED
router.put('/:aid', authenticateAdmin, async (req, res) => {
  try {
    const aid = parseInt(req.params.aid, 10);
    if (isNaN(aid)) return res.status(400).json({ success: false, error: 'Invalid admin id' });

    const updates: any = {};
    if (req.body.aName) updates.aName = req.body.aName;
    if (req.body.aSurname) updates.aSurname = req.body.aSurname;
    if (req.body.email !== undefined) updates.email = req.body.email;
    if (req.body.login) updates.login = req.body.login;
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(req.body.password, salt);
      updates.passwordLastChanged = new Date().toISOString();
    }

    // If updating login, check uniqueness
    if (updates.login) {
      const existing = await DatabaseQueries.getAdminByLogin(updates.login);
      if (existing && existing.aid !== aid) return res.status(409).json({ success: false, error: 'Login already in use' });
    }

    if (Object.keys(updates).length === 0) return res.status(400).json({ success: false, error: 'No valid fields to update' });

    await DatabaseQueries.updateAdmin(aid, updates);
    res.json({ success: true, message: 'Admin updated' });
  } catch (error) {
    console.error('Error updating admin:', error);
    res.status(500).json({ success: false, error: 'Failed to update admin', message: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// PUT /api/admins/:aid/password - change admin password - PROTECTED
router.put('/:aid/password', authenticateAdmin, async (req, res) => {
  try {
    const aid = parseInt(req.params.aid, 10);
    if (isNaN(aid)) return res.status(400).json({ success: false, error: 'Invalid admin id' });

    const { password } = req.body;
    if (!password) return res.status(400).json({ success: false, error: 'Password is required' });
    if (password.length < 6) return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });

    // Check if admin exists
    const admin = await DatabaseQueries.getAdminById(aid);
    if (!admin) return res.status(404).json({ success: false, error: 'Admin not found' });

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    await DatabaseQueries.updateAdmin(aid, { 
      password: hashed, 
      passwordLastChanged: new Date().toISOString() 
    });

    // Send password changed email
    if (admin.email) {
      EmailService.sendAdminPasswordChanged(admin.email, `${admin.aName} ${admin.aSurname}`);
    }

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing admin password:', error);
    res.status(500).json({ success: false, error: 'Failed to change password', message: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// POST /api/admins/login - admin login (public - returns token)
router.post('/login', async (req, res) => {
  try {
    const { login, password } = req.body;
    if (!login || !password) return res.status(400).json({ success: false, error: 'Login and password are required' });

    // Get admin by login (includes password for verification)
    const admin = await DatabaseQueries.getAdminByLogin(login);
    if (!admin) return res.status(401).json({ success: false, error: 'Invalid credentials' });

    // Verify password
    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) return res.status(401).json({ success: false, error: 'Invalid credentials' });

    // Generate JWT token
  const token = generateToken(admin.aid!, admin.login);

    // Return safe admin data (no password) + token
    const safeAdmin = {
      aid: admin.aid,
      aName: admin.aName,
      aSurname: admin.aSurname,
      email: admin.email,
      login: admin.login,
      passwordLastChanged: admin.passwordLastChanged,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt
    };

    // Send login notification email
    if (admin.email) {
      EmailService.sendAdminLogin(admin.email, `${admin.aName} ${admin.aSurname}`, new Date().toLocaleString());
    }

    res.json({ success: true, data: { ...safeAdmin, token }, message: 'Login successful' });
  } catch (error) {
    console.error('Error during admin login:', error);
    res.status(500).json({ success: false, error: 'Login failed', message: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// DELETE /api/admins/:aid - delete admin - PROTECTED
router.delete('/:aid', authenticateAdmin, async (req, res) => {
  try {
    const aid = parseInt(req.params.aid, 10);
    if (isNaN(aid)) return res.status(400).json({ success: false, error: 'Invalid admin id' });

    await DatabaseQueries.deleteAdmin(aid);
    res.json({ success: true, message: 'Admin deleted' });
  } catch (error) {
    console.error('Error deleting admin:', error);
    res.status(500).json({ success: false, error: 'Failed to delete admin', message: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default router;
