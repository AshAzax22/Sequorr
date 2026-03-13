const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

/**
 * @route   POST /api/admin/login
 * @desc    Validate admin API key and return JWT
 * @access  Public
 */
router.post('/login', (req, res) => {
  const { apiKey } = req.body;

  if (!apiKey) {
    return res.status(400).json({
      success: false,
      message: 'API Key is required'
    });
  }

  // Validate the secret key
  if (apiKey === process.env.ADMIN_API_KEY) {
    
    // We need a JWT secretly defined in .env, or use the ADMIN_API_KEY as the secret (not ideal, better to have a dedicated JWT_SECRET, but we'll use ADMIN_API_KEY if JWT_SECRET is unset for simplicity)
    const jwtSecret = process.env.JWT_SECRET || process.env.ADMIN_API_KEY;
    
    // Generate a JWT valid for 7 days
    const token = jwt.sign({ role: 'admin' }, jwtSecret, { expiresIn: '7d' });

    return res.json({
      success: true,
      message: 'Login successful',
      token,
    });
  } else {
    return res.status(401).json({
      success: false,
      message: 'Invalid API Key'
    });
  }
});

module.exports = router;
