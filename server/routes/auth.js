const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Boarding = require('../models/Boarding');
const { protect } = require('../middleware/auth');

const generateToken = (user) =>
  jwt.sign(
    { id: user._id, email: user.email, name: user.name, isAdmin: user.isAdmin, avatar: user.avatar },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

// ── Avatar upload setup ──────────────────────
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/avatars');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar_${req.user.id}_${Date.now()}${ext}`);
  },
});
const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/image\/(jpeg|jpg|png|webp|gif)/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

// ── POST /api/auth/register ──────────────────
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'All fields are required' });
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ success: false, message: 'Email already registered' });
    const user = await User.create({ name, email, password });
    const token = generateToken(user);
    res.status(201).json({
      success: true, token,
      user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin, avatar: user.avatar },
    });
  } catch (err) { next(err); }
});

// ── POST /api/auth/login ─────────────────────
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password required' });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    // ── Ban check ─────────────────────────────
    if (user.isBanned)
      return res.status(403).json({
        success: false,
        message: 'Your account has been banned. Please contact support.',
      });

    const token = generateToken(user);
    res.json({
      success: true, token,
      user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin, avatar: user.avatar },
    });
  } catch (err) { next(err); }
});

// ── GET /api/auth/me ─────────────────────────
router.get('/me', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password -resetPasswordToken -resetPasswordExpires');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) { next(err); }
});

// ── POST /api/auth/forgot-password ───────────
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ success: false, message: 'Email is required' });
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, message: 'No account found with that email' });
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
    await user.save({ validateBeforeSave: false });
    const resetUrl = `http://localhost:3000/reset-password/${rawToken}`;
    res.json({ success: true, message: 'Reset token generated', resetUrl, devNote: 'In production, send this by email.' });
  } catch (err) { next(err); }
});

// ── POST /api/auth/reset-password/:token ─────
router.post('/reset-password/:token', async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ resetPasswordToken: hashedToken, resetPasswordExpires: { $gt: Date.now() } });
    if (!user)
      return res.status(400).json({ success: false, message: 'Reset link is invalid or has expired' });
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    const token = generateToken(user);
    res.json({ success: true, message: 'Password reset successfully', token, user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin, avatar: user.avatar } });
  } catch (err) { next(err); }
});

// ── GET /api/auth/profile ────────────────────
router.get('/profile', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password -resetPasswordToken -resetPasswordExpires');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const boardings = await Boarding.find({ owner: req.user.id }).sort({ createdAt: -1 });
    const favoritesCount = user.favorites?.length || 0;
    res.json({ success: true, user, boardings, favoritesCount });
  } catch (err) { next(err); }
});

// ── PUT /api/auth/profile ────────────────────
router.put('/profile', protect, async (req, res, next) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (email && email !== user.email) {
      const taken = await User.findOne({ email });
      if (taken) return res.status(400).json({ success: false, message: 'Email is already in use' });
      user.email = email;
    }
    if (name) user.name = name;
    if (newPassword) {
      if (!currentPassword)
        return res.status(400).json({ success: false, message: 'Current password is required' });
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch)
        return res.status(401).json({ success: false, message: 'Current password is incorrect' });
      if (newPassword.length < 6)
        return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
      user.password = newPassword;
    }
    await user.save();
    const token = generateToken(user);
    res.json({ success: true, message: 'Profile updated', token, user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin, avatar: user.avatar } });
  } catch (err) { next(err); }
});

// ── POST /api/auth/avatar ─────────────────────
router.post('/avatar', protect, avatarUpload.single('avatar'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No image file provided' });
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.avatar) {
      const oldPath = path.join(__dirname, '../uploads/avatars', user.avatar);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    user.avatar = req.file.filename;
    await user.save();
    const token = generateToken(user);
    res.json({ success: true, message: 'Avatar updated', avatar: user.avatar, token, user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin, avatar: user.avatar } });
  } catch (err) { next(err); }
});

// ── DELETE /api/auth/avatar ───────────────────
router.delete('/avatar', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.avatar) {
      const filePath = path.join(__dirname, '../uploads/avatars', user.avatar);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      user.avatar = null;
      await user.save();
    }
    const token = generateToken(user);
    res.json({ success: true, message: 'Avatar removed', token, user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin, avatar: null } });
  } catch (err) { next(err); }
});

// ── DELETE /api/auth/profile/boarding/:id ────
router.delete('/profile/boarding/:boardingId', protect, async (req, res, next) => {
  try {
    const boarding = await Boarding.findOne({ _id: req.params.boardingId, owner: req.user.id });
    if (!boarding) return res.status(404).json({ success: false, message: 'Listing not found or not yours' });
    await boarding.deleteOne();
    res.json({ success: true, message: 'Listing deleted' });
  } catch (err) { next(err); }
});

module.exports = router;