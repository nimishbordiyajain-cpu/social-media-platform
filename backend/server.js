require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');

const app = express();

// Allowed origins for CORS (supports comma-separated list and strips trailing slashes)
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((url) => url.trim().replace(/\/+$/, ''))
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (e.g. mobile apps, curl, Postman)
      if (!origin) return callback(null, true);

      // if CLIENT_URL is not configured or set to wildcard '*', allow all
      if (allowedOrigins.length === 0 || allowedOrigins.includes('*')) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.replace(/\/+$/, '');
      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      // Automatically allow Vercel deployments of the social-media-platform project
      if (/^https:\/\/social-media-platform(-[a-z0-9-]+)?\.vercel\.app$/.test(normalizedOrigin)) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    credentials: true,
  })
);

// JSON body parser
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.send('Social Media API is running');
});

// Diagnostic endpoint
app.get('/api/health', async (req, res) => {
  const hasMongoUri = Boolean(process.env.MONGO_URI);
  let dbStatus = 'disconnected';
  let dbError = null;

  try {
    await connectDB();
    dbStatus = 'connected';
    return res.json({
      status: 'ok',
      database: {
        status: dbStatus,
      },
      clientUrl: process.env.CLIENT_URL || null,
    });
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      database: {
        status: dbStatus,
        hasUri: hasMongoUri,
        error: err.message,
        name: err.name,
      },
      clientUrl: process.env.CLIENT_URL || null,
    });
  }
});

// Make sure MongoDB is connected before API requests
app.use('/api', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Database connection error:', error);

    res.status(500).json({
      message: 'Database connection failed',
      error: error.message,
      name: error.name,
    });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');

    return res.status(400).json({
      message
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      message: 'Invalid ID format'
    });
  }

  res.status(500).json({
    message: 'Server error'
  });
});

// Local development only
if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.error('Failed to start server:', error);
      process.exit(1);
    });
}

module.exports = app;