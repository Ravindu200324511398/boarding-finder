// ============================================
// JWT Authentication Middleware
// ============================================
const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  // Get token from Authorization header: "Bearer <token>"
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const err = new Error('Not authorized, no token provided');
    err.statusCode = 401;
    return next(err);
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify the token using our secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email }
    next();
  } catch (error) {
    const err = new Error('Not authorized, token invalid or expired');
    err.statusCode = 401;
    next(err);
  }
};

module.exports = { protect };