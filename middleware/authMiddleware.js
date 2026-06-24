const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect middleware to verify JWT token and attach user to request object
exports.protect = async (req, res, next) => {
  let token;

  // 1. Check if token is sent in the Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from Bearer <token>
      token = req.headers.authorization.split(' ')[1];

      // 2. Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Find user in the database (exclude password from selection)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'The user belonging to this token no longer exists.',
        });
      }

      // 4. Continue to the next middleware/handler
      return next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed or expired',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided in Authorization header',
    });
  }
};

// Restrict access to specific user roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // req.user is set by the protect middleware
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user ? req.user.role : 'unknown'}' is not allowed to perform this action.`,
      });
    }
    return next();
  };
};
