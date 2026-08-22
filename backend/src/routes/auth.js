// backend/src/routes/auth.js

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const auth = require('../middleware/auth');  // ← IMPORTANT!

const router = express.Router();

// ============================================
// REGISTER
// POST /api/auth/register
// ============================================
router.post('/register', async (req, res) => {
  const { name, email, password, role, phone, location } = req.body;

  try {
    // Check if user exists
    const userExists = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Validate role
    const validRoles = ['farmer', 'vet', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be farmer, vet, or admin'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const newUser = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, phone, location)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, role, phone, location, created_at`,
      [name, email, hashedPassword, role, phone, location]
    );

    // Generate JWT
    const token = jwt.sign(
      { id: newUser.rows[0].id, role: newUser.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully! 🎉',
      token: token,
      user: newUser.rows[0]
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
});

// ============================================
// LOGIN
// POST /api/auth/login
// ============================================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password ❌'
      });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.rows[0].password_hash
    );

    if (!validPassword) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password ❌'
      });
    }

    const token = jwt.sign(
      { id: user.rows[0].id, role: user.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password_hash, ...userData } = user.rows[0];

    res.json({
      success: true,
      message: 'Login successful! ✅',
      token: token,
      user: userData
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
});

// ============================================
// UPDATE PROFILE
// PUT /api/auth/profile
// ============================================
router.put('/profile', auth, async (req, res) => {
  const { name, phone, location } = req.body;
  const userId = req.user.id;

  try {
    const updatedUser = await pool.query(
      `UPDATE users 
       SET name = COALESCE($1, name),
           phone = COALESCE($2, phone),
           location = COALESCE($3, location)
       WHERE id = $4
       RETURNING id, name, email, role, phone, location, created_at`,
      [name, phone, location, userId]
    );

    if (updatedUser.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found ❌'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully! ✅',
      user: updatedUser.rows[0]
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;