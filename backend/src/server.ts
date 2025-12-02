import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { initializeDatabase } from './database/init';
import { apiLimiter, appointmentLimiter, userLimiter } from './middleware/rateLimiter';

// Import routes
import appointmentsRoutes from './routes/appointments';
import usersRoutes from './routes/users';
import settingsRoutes from './routes/settings';
import adminRoutes from './routes/admin';
import blockedRoutes from './routes/blocked';
import emailSettingsRoutes from './routes/emailSettings';
import appointmentTypesRoutes from './routes/appointmentTypes';
import licenseRoutes from './routes/license';
import gumroadRoutes from './routes/gumroad';
import newslettersRoutes from './routes/newsletters';
import userDataRoutes from './routes/userData';
import aboutRoutes from './routes/about';
import homeContentRoutes from './routes/homecontent';

// Load environment variables from root .env file (if exists)
// In Docker, env vars are passed directly; in dev, load from .env file
const envPath = path.join(__dirname, '../../.env');
dotenv.config({ path: envPath });

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const DB_TYPE = (process.env.DB_TYPE || 'sqlite').toLowerCase();

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Apply rate limiting
app.use('/api/', apiLimiter);
app.use('/api/appointments', appointmentLimiter);
app.use('/api/users', userLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Appointment Scheduler API Server is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/blocked', blockedRoutes);
app.use('/api/email-settings', emailSettingsRoutes);
app.use('/api/appointment-types', appointmentTypesRoutes);
app.use('/api/license', licenseRoutes);
app.use('/api/gumroad', gumroadRoutes);
app.use('/api/newsletters', newslettersRoutes);
app.use('/api/user-data', userDataRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/homecontent', homeContentRoutes);

// API Status endpoint
app.get('/api/status', async (req, res) => {
  try {
  const { DatabaseQueries } = await import('./database');
    const settings = await DatabaseQueries.getSettings();
    
    res.json({
      success: true,
      service: 'Appointment Scheduler API',
      status: 'active',
      timestamp: new Date().toISOString(),
      database: DB_TYPE === 'mongodb' ? 'MongoDB' : 'SQLite3',
      settings: {
        maxAppointmentsPerDay: settings.maxApp,
        maxAppointmentsPerWeek: settings.maxAppWeek
      },
      endpoints: {
        appointments: '/api/appointments',
        users: '/api/users',
        settings: '/api/settings'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Database connection failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Serve static files from React frontend in production
if (NODE_ENV === 'production') {
  // In Docker: __dirname is /app/dist, frontend is at /app/frontend/dist
  // In dev with ts-node: __dirname is /path/to/backend/src, frontend is at /path/to/frontend/dist
  const frontendPath = process.env.FRONTEND_PATH || path.join(__dirname, '../../frontend/dist');
  
  // Serve static files
  app.use(express.static(frontendPath));
  
  // Handle React routing - send all non-API requests to index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
} else {
  // Development mode - API-only, frontend runs separately on port 3000
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      error: 'Route not found',
      message: `The requested endpoint ${req.originalUrl} does not exist`
    });
  });
}

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    if (DB_TYPE === 'mongodb') {
      const { initializeMongo } = await import('./database/mongoInit');
      await initializeMongo();
    } else {
      await initializeDatabase();
    }
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Appointment Scheduler API Server running on http://localhost:${PORT}`);
      console.log(`📊 Database: ${DB_TYPE === 'mongodb' ? 'MongoDB' : 'SQLite3'}`);
      console.log(`🔒 Rate limiting enabled`);
      console.log(`🌍 Environment: ${NODE_ENV}`);
      
      if (NODE_ENV === 'production') {
        console.log(`📦 Serving frontend static files`);
        console.log(`🌐 Application available at: http://localhost:${PORT}`);
      } else {
        console.log(`🔧 Development mode - Frontend runs separately on port 5173`);
      }
      
      console.log(`📅 API Endpoints:`);
      console.log(`   - GET  /api/health`);
      console.log(`   - GET  /api/status`);
      console.log(`   - GET  /api/appointments`);
      console.log(`   - POST /api/appointments`);
      console.log(`   - GET  /api/users`);
      console.log(`   - POST /api/users`);
      console.log(`   - GET  /api/settings`);
      console.log(`   - PUT  /api/settings`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();