require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

// Import Routes
const authRoutes = require('./routes/auth');
const boardingRoutes = require('./routes/boardings');
const favoriteRoutes = require('./routes/favorites');

const app = express();

// ── Middleware ──────────────────────────────
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes ──────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/boardings', boardingRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/admin', require('./routes/admin'));
app.use('/api/ratings', require('./routes/ratings'));

// ── Health Check ────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Boarding Finder API is running' });
});

// ── Global Error Handler ────────────────────
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ── Connect DB & Start Server ───────────────
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/boarding_finder';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });