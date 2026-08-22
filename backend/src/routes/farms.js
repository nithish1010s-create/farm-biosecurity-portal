// backend/src/routes/farms.js

const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

// ============================================
// CREATE FARM (Farmer only)
// POST /api/farms
// ============================================
router.post('/', auth, async (req, res) => {
  const { name, latitude, longitude, livestock_type, livestock_count } = req.body;
  const farmer_id = req.user.id;

  // Check if user is a farmer
  if (req.user.role !== 'farmer') {
    return res.status(403).json({
      success: false,
      message: 'Only farmers can create farms ❌'
    });
  }

  // Validate livestock_type
  const validTypes = ['pig', 'poultry', 'both'];
  if (!validTypes.includes(livestock_type)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid livestock type. Must be pig, poultry, or both'
    });
  }

  try {
    const newFarm = await pool.query(
      `INSERT INTO farms (farmer_id, name, latitude, longitude, livestock_type, livestock_count)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [farmer_id, name, latitude, longitude, livestock_type, livestock_count]
    );

    res.status(201).json({
      success: true,
      message: 'Farm created successfully! 🎉',
      farm: newFarm.rows[0]
    });

  } catch (error) {
    console.error('Create farm error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// ============================================
// GET MY FARMS (Farmer)
// GET /api/farms/my-farms
// ============================================
router.get('/my-farms', auth, async (req, res) => {
  try {
    const farms = await pool.query(
      'SELECT * FROM farms WHERE farmer_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );

    res.json({
      success: true,
      count: farms.rows.length,
      farms: farms.rows
    });

  } catch (error) {
    console.error('Get farms error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// ============================================
// GET ALL FARMS (Vet/Admin only)
// GET /api/farms
// ============================================
router.get('/', auth, async (req, res) => {
  // Check if user is vet or admin
  if (req.user.role !== 'vet' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Vets and Admins only ❌'
    });
  }

  try {
    const farms = await pool.query(
      `SELECT f.*, u.name as farmer_name, u.phone as farmer_phone, u.location as farmer_location
       FROM farms f
       JOIN users u ON f.farmer_id = u.id
       ORDER BY f.created_at DESC`
    );

    res.json({
      success: true,
      count: farms.rows.length,
      farms: farms.rows
    });

  } catch (error) {
    console.error('Get all farms error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// ============================================
// GET FARM BY ID
// GET /api/farms/:id
// ============================================
router.get('/:id', auth, async (req, res) => {
  const { id } = req.params;

  try {
    const farm = await pool.query(
      `SELECT f.*, u.name as farmer_name, u.phone as farmer_phone
       FROM farms f
       JOIN users u ON f.farmer_id = u.id
       WHERE f.id = $1`,
      [id]
    );

    if (farm.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found ❌'
      });
    }

    // Check if user has access
    const farmData = farm.rows[0];
    if (req.user.role === 'farmer' && farmData.farmer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This is not your farm ❌'
      });
    }

    res.json({
      success: true,
      farm: farmData
    });

  } catch (error) {
    console.error('Get farm error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;