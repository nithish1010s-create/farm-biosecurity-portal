// backend/src/routes/checklists.js

const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

// ============================================
// CHECKLIST QUESTIONS
// ============================================
const QUESTIONS = [
  "Farm entrance sanitized today?",
  "All visitors logged and sanitized?",
  "PPE (gloves, mask, boots) worn by all workers?",
  "Feed storage area clean and pest-free?",
  "Water source checked and clean?",
  "Any sick animals observed today?",
  "Dead animal disposal done properly?",
  "Vehicle disinfection done before entry?"
];

// ============================================
// SUBMIT CHECKLIST (Farmer only)
// POST /api/checklists
// ============================================
router.post('/', auth, async (req, res) => {
  const { farm_id, answers, notes } = req.body;
  
  // Check if user is a farmer
  if (req.user.role !== 'farmer') {
    return res.status(403).json({
      success: false,
      message: 'Only farmers can submit checklists ❌'
    });
  }

  // Validate answers
  if (!answers || typeof answers !== 'object') {
    return res.status(400).json({
      success: false,
      message: 'Answers are required'
    });
  }

  // Calculate compliance score
  const total = QUESTIONS.length;
  let yesCount = 0;
  for (const key in answers) {
    if (answers[key] === 'yes') yesCount++;
  }
  const compliance_score = Math.round((yesCount / total) * 100);

  try {
    // Verify farm belongs to farmer
    const farm = await pool.query(
      'SELECT * FROM farms WHERE id = $1 AND farmer_id = $2',
      [farm_id, req.user.id]
    );

    if (farm.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized for this farm ❌'
      });
    }

    // Insert checklist
    const newChecklist = await pool.query(
      `INSERT INTO checklists (farm_id, checklist_data, compliance_score, notes)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [farm_id, answers, compliance_score, notes]
    );

    // Update farm biosecurity score (average of all checklists)
    const avgResult = await pool.query(
      'SELECT AVG(compliance_score) as avg_score FROM checklists WHERE farm_id = $1',
      [farm_id]
    );
    const avgScore = Math.round(avgResult.rows[0].avg_score || 0);
    await pool.query(
      'UPDATE farms SET biosecurity_score = $1 WHERE id = $2',
      [avgScore, farm_id]
    );

    // If score < 60, create automatic alert
    if (compliance_score < 60) {
      await pool.query(
        `INSERT INTO alerts (title, description, severity, affected_farms)
         VALUES ($1, $2, $3, $4)`,
        [
          'Low Biosecurity Compliance Alert',
          `Farm ${farm.rows[0].name} has low compliance score: ${compliance_score}%`,
          'high',
          [farm_id]
        ]
      );
    }

    res.status(201).json({
      success: true,
      message: 'Checklist submitted successfully! ✅',
      checklist: newChecklist.rows[0],
      compliance_score: compliance_score,
      total_questions: total,
      answered_yes: yesCount
    });

  } catch (error) {
    console.error('Checklist submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// ============================================
// GET CHECKLIST HISTORY
// GET /api/checklists/farm/:farmId
// ============================================
router.get('/farm/:farmId', auth, async (req, res) => {
  const { farmId } = req.params;

  try {
    // Check authorization
    const farm = await pool.query(
      'SELECT farmer_id FROM farms WHERE id = $1',
      [farmId]
    );

    if (farm.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found ❌'
      });
    }

    // Allow: farmer owns farm, or vet/admin
    const isOwner = farm.rows[0].farmer_id === req.user.id;
    const isVetOrAdmin = req.user.role === 'vet' || req.user.role === 'admin';

    if (!isOwner && !isVetOrAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied ❌'
      });
    }

    const checklists = await pool.query(
      `SELECT * FROM checklists 
       WHERE farm_id = $1 
       ORDER BY date DESC, created_at DESC`,
      [farmId]
    );

    res.json({
      success: true,
      count: checklists.rows.length,
      checklists: checklists.rows
    });

  } catch (error) {
    console.error('Get checklists error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// ============================================
// GET COMPLIANCE SCORE
// GET /api/checklists/compliance/:farmId
// ============================================
router.get('/compliance/:farmId', auth, async (req, res) => {
  const { farmId } = req.params;

  try {
    // Check authorization
    const farm = await pool.query(
      'SELECT farmer_id FROM farms WHERE id = $1',
      [farmId]
    );

    if (farm.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found ❌'
      });
    }

    const isOwner = farm.rows[0].farmer_id === req.user.id;
    const isVetOrAdmin = req.user.role === 'vet' || req.user.role === 'admin';

    if (!isOwner && !isVetOrAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied ❌'
      });
    }

    // Get latest score
    const latest = await pool.query(
      `SELECT compliance_score, date, checklist_data
       FROM checklists 
       WHERE farm_id = $1 
       ORDER BY date DESC, created_at DESC 
       LIMIT 1`,
      [farmId]
    );

    // Get average score
    const avgResult = await pool.query(
      'SELECT AVG(compliance_score) as avg_score FROM checklists WHERE farm_id = $1',
      [farmId]
    );

    const latestScore = latest.rows.length > 0 ? latest.rows[0] : null;

    res.json({
      success: true,
      farm_id: parseInt(farmId),
      latest_score: latestScore ? latestScore.compliance_score : 0,
      latest_date: latestScore ? latestScore.date : null,
      average_score: Math.round(avgResult.rows[0].avg_score || 0),
      total_entries: latest.rows.length,
      latest_data: latestScore ? latestScore.checklist_data : null
    });

  } catch (error) {
    console.error('Get compliance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;