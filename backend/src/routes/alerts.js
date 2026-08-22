// backend/src/routes/alerts.js

const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

// ============================================
// CREATE ALERT (Admin/Vet only)
// POST /api/alerts
// ============================================
router.post('/', auth, async (req, res) => {
  const { title, description, severity, affected_areas, affected_farms } = req.body;

  // Check if user is admin or vet
  if (req.user.role !== 'admin' && req.user.role !== 'vet') {
    return res.status(403).json({
      success: false,
      message: 'Only Admins and Vets can create alerts ❌'
    });
  }

  // Validate severity
  const validSeverity = ['low', 'medium', 'high', 'critical'];
  if (severity && !validSeverity.includes(severity)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid severity. Must be low, medium, high, or critical'
    });
  }

  try {
    const newAlert = await pool.query(
      `INSERT INTO alerts (title, description, severity, affected_areas, affected_farms, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, description, severity || 'medium', affected_areas || [], affected_farms || [], req.user.id]
    );

    res.status(201).json({
      success: true,
      message: 'Alert created successfully! 🔔',
      alert: newAlert.rows[0]
    });

  } catch (error) {
    console.error('Create alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// ============================================
// GET ALL ALERTS
// GET /api/alerts
// ============================================
router.get('/', auth, async (req, res) => {
  try {
    const alerts = await pool.query(
      `SELECT a.*, u.name as created_by_name
       FROM alerts a
       LEFT JOIN users u ON a.created_by = u.id
       ORDER BY a.created_at DESC
       LIMIT 50`
    );

    res.json({
      success: true,
      count: alerts.rows.length,
      alerts: alerts.rows
    });

  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// ============================================
// GET ALERT BY ID
// GET /api/alerts/:id
// ============================================
router.get('/:id', auth, async (req, res) => {
  const { id } = req.params;

  try {
    const alert = await pool.query(
      `SELECT a.*, u.name as created_by_name
       FROM alerts a
       LEFT JOIN users u ON a.created_by = u.id
       WHERE a.id = $1`,
      [id]
    );

    if (alert.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found ❌'
      });
    }

    res.json({
      success: true,
      alert: alert.rows[0]
    });

  } catch (error) {
    console.error('Get alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;