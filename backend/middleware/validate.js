// ---------- middleware/validate.js : request body validation ----------
// These run before the controller and reject bad input with 400.
// (Mongoose schema validation is a second safety net when saving.)

const validateRegister = (req, res, next) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  next();
};

// Factory: validate a text field with a max length (used for posts and comments)
const validateText = (field, label, maxLength) => (req, res, next) => {
  const value = req.body[field];
  if (typeof value !== 'string' || value.trim().length === 0) {
    return res.status(400).json({ message: `${label} is required and cannot be empty` });
  }
  if (value.trim().length > maxLength) {
    return res.status(400).json({ message: `${label} cannot exceed ${maxLength} characters` });
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validatePost: validateText('content', 'Post content', 500),
  validateComment: validateText('text', 'Comment text', 200),
};
