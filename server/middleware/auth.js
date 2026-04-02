// // ============================================
// // JWT Authentication Middleware
// // ============================================
// const jwt = require('jsonwebtoken');

// const protect = (req, res, next) => {
//   // Get token from Authorization header: "Bearer <token>"
//   const authHeader = req.headers.authorization;

//   if (!authHeader || !authHeader.startsWith('Bearer ')) {
//     const err = new Error('Not authorized, no token provided');
//     err.statusCode = 401;
//     return next(err);
//   }

//   const token = authHeader.split(' ')[1];

//   try {
//     // Verify the token using our secret
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded; // { id, email }
//     next();
//   } catch (error) {
//     const err = new Error('Not authorized, token invalid or expired');
//     err.statusCode = 401;
//     next(err);
//   }
// };

// module.exports = { protect };
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    if (user.isBanned) {
      return res.status(403).json({ success: false, message: 'Your account has been banned. Please contact support.' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};