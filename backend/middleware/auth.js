// ---------- middleware/auth.js : JWT authentication ----------
// Runs BEFORE a protected route. It checks the token sent by the client.
// Client must send header:  Authorization: Bearer <token>
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getJwtSecret } = require('../config/jwt');

const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    // 1. Is there a token?
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized, token missing' });
    }
    const token = header.split(' ')[1];

    // 2. Is the token valid and not expired? (throws error if not)
    const decoded = jwt.verify(token, getJwtSecret());

    // 3. Does the user still exist?
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    // 4. Attach user to request so controllers know WHO is calling
    req.user = user;
    next();
  } catch (error) {
    if (error.message === 'JWT_SECRET environment variable is missing') {
      return next(error);
    }
    return res.status(401).json({ message: 'Not authorized, token invalid or expired' });
  }
};

module.exports = protect;
