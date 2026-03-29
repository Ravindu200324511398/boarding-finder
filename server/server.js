// server/server.js
// Add the AI route alongside your existing routes.
// Only the relevant lines are shown — add the two marked lines to your existing server.js

require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const mongoose = require('mongoose');
const path    = require('path');

const authRoutes     = require('./routes/auth');
const boardingRoutes = require('./routes/boardings');
const favoriteRoutes = require('./routes/favorites');
const aiRoutes       = require('./routes/ai');          // ← ADD THIS

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads',         express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/avatars', express.static(path.join(__dirname, 'uploads/avatars')));

app.use('/api/auth',      authRoutes);
app.use('/api/boardings', boardingRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/admin',     require('./routes/admin'));
app.use('/api/ratings',   require('./routes/ratings'));
app.use('/api/ai',        aiRoutes);                   // ← ADD THIS

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Boarding Finder API is running' });
});

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Internal Server Error' });
});

const PORT     = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/boarding_finder';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch(err => { console.error('❌ MongoDB failed:', err.message); process.exit(1); });