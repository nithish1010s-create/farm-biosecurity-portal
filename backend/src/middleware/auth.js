// backend/src/middleware/auth.js

const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Get token from header
  const authHeader = req.header('Authorization');
  
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'No token, authorization denied ❌'
    });
  }

  // Remove 'Bearer ' from token
  const token = authHeader.replace('Bearer ', '');

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token is not valid ❌'
    });
  }
};