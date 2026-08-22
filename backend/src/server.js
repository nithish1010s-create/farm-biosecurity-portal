// backend/src/server.js

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const pool = require('./db');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ============================================
// IMPORT ROUTES
// ============================================
const authRoutes = require('./routes/auth');
const farmRoutes = require('./routes/farms');
const checklistRoutes = require('./routes/checklists');
const alertRoutes = require('./routes/alerts');

// ============================================
// USE ROUTES
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/farms', farmRoutes);
app.use('/api/checklists', checklistRoutes);
app.use('/api/alerts', alertRoutes);

// ============================================
// TEST ROUTES
// ============================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is running successfully! 🚀',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as current_time');
    res.json({
      success: true,
      message: 'Database connected successfully! ✅',
      currentTime: result.rows[0].current_time,
      database: process.env.DB_NAME
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      message: 'Database connection failed ❌',
      error: error.message
    });
  }
});

app.get('/', (req, res) => {
  res.json({
    name: 'Farm Biosecurity Portal API',
    version: '1.0.0',
    status: 'running ✅',
    endpoints: {
      health: 'GET /api/health',
      testDB: 'GET /api/test-db',
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      createFarm: 'POST /api/farms',
      myFarms: 'GET /api/farms/my-farms',
      allFarms: 'GET /api/farms',
      submitChecklist: 'POST /api/checklists',
      checklistHistory: 'GET /api/checklists/farm/:id',
      complianceScore: 'GET /api/checklists/compliance/:id',
      createAlert: 'POST /api/alerts',
      getAlerts: 'GET /api/alerts',
      getAlert: 'GET /api/alerts/:id'
    }
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('========================================');
  console.log('🚀 Farm Biosecurity Portal Backend');
  console.log('========================================');
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📍 Database test: http://localhost:${PORT}/api/test-db`);
  console.log(`📍 Register: POST http://localhost:${PORT}/api/auth/register`);
  console.log(`📍 Login: POST http://localhost:${PORT}/api/auth/login`);
  console.log(`📍 Create Farm: POST http://localhost:${PORT}/api/farms`);
  console.log(`📍 My Farms: GET http://localhost:${PORT}/api/farms/my-farms`);
  console.log(`📍 All Farms: GET http://localhost:${PORT}/api/farms`);
  console.log(`📍 Submit Checklist: POST http://localhost:${PORT}/api/checklists`);
  console.log(`📍 Checklist History: GET http://localhost:${PORT}/api/checklists/farm/:id`);
  console.log(`📍 Compliance Score: GET http://localhost:${PORT}/api/checklists/compliance/:id`);
  console.log(`📍 Create Alert: POST http://localhost:${PORT}/api/alerts`);
  console.log(`📍 Get Alerts: GET http://localhost:${PORT}/api/alerts`);
  console.log(`📍 Get Alert: GET http://localhost:${PORT}/api/alerts/:id`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('========================================');
  console.log('Press Ctrl+C to stop the server');
  console.log('========================================');
});