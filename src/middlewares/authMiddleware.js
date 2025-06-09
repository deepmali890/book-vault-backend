const jwt = require('jsonwebtoken');
const User = require('../models/auth.model');

const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token; // Grab token from cookie

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, token missing' });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by decoded id
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Email not verified. Access denied.' });
    }

    // Attach user to request object for next routes
    req.user = user;
    next(); // Go to next middleware or route handler
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ message: 'Invalid token or unauthorized access' });
  }
};

module.exports = protect;
