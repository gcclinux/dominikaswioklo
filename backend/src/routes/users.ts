import express from 'express';
import { DatabaseQueries } from '../database';
import { ApiResponse } from '../types';
import { authenticateAdmin } from '../middleware/auth';

const router = express.Router();

// GET /api/users - Get all users - PROTECTED
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const users = await DatabaseQueries.getUsers();

    // Determine blocked status per user (uses ipAddress and uid)
  const safeUsers = await Promise.all(users.map(async (user: any) => {
      let blocked = false;
      try {
        blocked = await DatabaseQueries.isBlocked(user.ipAddress || 'unknown', user.uid);
      } catch (e) {
        // ignore and treat as not blocked on error
        blocked = false;
      }
      return {
        uid: user.uid,
        name: user.name,
        middle: user.middle,
        surname: user.surname,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt,
        blocked
      };
    }));
    
    const response: ApiResponse = {
      success: true,
      data: safeUsers,
      message: `Found ${safeUsers.length} users`
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/users/email/:email - Get user by email - PROTECTED
router.get('/email/:email', authenticateAdmin, async (req, res) => {
  try {
    const { email } = req.params;
    
    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }
    
    const user = await DatabaseQueries.getUserByEmail(email);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Remove sensitive information
    const safeUser = {
      uid: user.uid,
      name: user.name,
      middle: user.middle,
      surname: user.surname,
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt
    };
    
    const response: ApiResponse = {
      success: true,
      data: safeUser,
      message: 'User found'
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching user by email:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/users - Create new user - PUBLIC (used during appointment booking)
router.post('/', async (req, res) => {
  try {
    const userData = req.body;
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
    
    // Validate required fields
    if (!userData.name || !userData.surname || !userData.email) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, surname, email'
      });
    }
    
    // Check if user already exists
    const existingUser = await DatabaseQueries.getUserByEmail(userData.email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User with this email already exists'
      });
    }
    
    // Check if IP is blocked
    const isBlocked = await DatabaseQueries.isBlocked(clientIp);
    if (isBlocked) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. IP address is blocked.'
      });
    }
    
    const userId = await DatabaseQueries.createUser({
      ...userData,
      ipAddress: clientIp
    });
    
    const response: ApiResponse = {
      success: true,
      data: {
        userId,
        message: 'User created successfully'
      },
      message: 'User registered successfully'
    };
    
    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create user',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /api/users/:id - Update user details - PROTECTED
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ success: false, error: 'Invalid id' });
    
    const { name, middle, surname, email, phone } = req.body;
    
    // Validate at least one field is provided
    if (!name && !middle && !surname && !email && !phone) {
      return res.status(400).json({ success: false, error: 'No fields to update' });
    }
    
    await DatabaseQueries.updateUser(id, { name, middle, surname, email, phone });
    res.json({ success: true, message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, error: 'Failed to update user' });
  }
});

// DELETE /api/users/:id - remove a user - PROTECTED
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ success: false, error: 'Invalid id' });
    await DatabaseQueries.deleteUser(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, error: 'Failed to delete user' });
  }
});

export default router;