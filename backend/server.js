require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');

const app = express();

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true
  })
);

// JSON body parser
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.send('Social Media API is running');
});

// Make sure MongoDB is connected before API requests
app.use('/api', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Database connection error:', error);

    res.status(500).json({
      message: 'Database connection failed'
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