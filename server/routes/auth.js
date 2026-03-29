const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const generateToken = (user) => jwt.sign(
  { id: user._id, email: user.email, name: user.name, isAdmin: user.isAdmin },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success:false, message:'All fields are required' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success:false, message:'Email already registered' });
    const user = await User.create({ name, email, password });
    const token = generateToken(user);
    res.status(201).json({ success:true, token, user:{ id:user._id, name:user.name, email:user.email, isAdmin:user.isAdmin } });
  } catch (err) { next(err); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success:false, message:'Email and password required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ success:false, message:'Invalid email or password' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success:false, message:'Invalid email or password' });
    const token = generateToken(user);
    res.json({ success:true, token, user:{ id:user._id, name:user.name, email:user.email, isAdmin:user.isAdmin } });
  } catch (err) { next(err); }
});

router.get('/me', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ success:false, message:'User not found' });
    res.json({ success:true, user });
  } catch (err) { next(err); }
});

module.exports = router;
