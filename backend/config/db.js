// ---------- config/db.js : MongoDB Atlas connection ----------
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    // Prints WHERE data is being saved - handy for checking Atlas
    console.log(`MongoDB connected -> host: ${conn.connection.host} | database: ${conn.connection.name}`);
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1); // stop the app if DB is not reachable
  }
};

module.exports = connectDB;
