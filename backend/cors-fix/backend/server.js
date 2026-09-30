// ---------- server.js : entry point of the backend ----------
require('dotenv').config();            // load variables from .env into process.env
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');

const app = express();

// ----- Global middlewares -----
// CORS: only the frontend URL(s) in CLIENT_URL may call this API.
// Several URLs can be separated by commas; a trailing slash is ignored.
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((url) => url.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // no origin = Postman/curl; empty list = allow all (local testing)
      const ok = !origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin);
      callback(null, ok);
    },
  })
);
app.use(express.json());                                   // parse JSON request bodies

// ----- Make sure the database is connected before handling any request -----
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    res.status(500).json({ message: 'Database connection failed' });
  }
});

// ----- Routes -----
app.get('/', (req, res) => res.send('Social Media API is running'));
app.use('/api/auth', authRoutes);         // register + login (public)
app.use('/api/posts', postRoutes);        // posts, likes, comments on a post (protected)
app.use('/api/comments', commentRoutes);  // edit/delete a comment (protected)

// ----- 404 handler (no route matched) -----
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// ----- Central error handler -----
app.use((err, req, res, next) => {
  console.error(err);
  // Mongoose validation error -> 400 with readable messages
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((e) => e.message).join(', ');
    return res.status(400).json({ message });
  }
  // Invalid ObjectId in URL (e.g. /posts/abc)
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }
  res.status(500).json({ message: 'Server error' });
});

// Local development: start the server. On Vercel the app is exported instead (no listen).
const PORT = process.env.PORT || 5000;
if (require.main === module) {
  connectDB()
    .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
    .catch((error) => {
      console.error('MongoDB connection failed:', error.message);
      process.exit(1);
    });
}

module.exports = app;
