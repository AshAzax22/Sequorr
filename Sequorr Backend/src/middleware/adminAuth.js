const jwt = require('jsonwebtoken');

/**
 * Admin authentication middleware.
 * Checks the `Authorization: Bearer <token>` header against a JWT.
 */
const adminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized — missing or invalid token format',
    });
  }

  const token = authHeader.split(' ')[1];
  const jwtSecret = process.env.JWT_SECRET || process.env.ADMIN_API_KEY;

  try {
    const decoded = jwt.verify(token, jwtSecret);
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden — insufficient permissions' });
    }
    
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized — expired or invalid token',
    });
  }
};

module.exports = adminAuth;
