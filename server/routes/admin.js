const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Boarding = require('../models/Boarding');
const { adminProtect } = require('../middleware/admin');

// ── GET /api/admin/stats ─────────────────────
router.get('/stats', adminProtect, async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ isAdmin: false });
    const totalBoardings = await Boarding.countDocuments();
    const totalAdmins = await User.countDocuments({ isAdmin: true });
    const recentBoardings = await Boarding.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('owner', 'name email');
    const recentUsers = await User.find({ isAdmin: false })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('-password');
    const boardingsByType = await Boarding.aggregate([
      { $group: { _id: '$roomType', count: { $sum: 1 } } }
    ]);
    const avgPrice = await Boarding.aggregate([
      { $group: { _id: null, avg: { $avg: '$price' } } }
    ]);
    res.json({
      success: true,
      stats: {
        totalUsers,
        totalBoardings,
        totalAdmins,
        avgPrice: avgPrice[0]?.avg || 0,
        boardingsByType,
        recentBoardings,
        recentUsers,
      },
    });
  } catch (err) { next(err); }
});

// ── GET /api/admin/users ─────────────────────
router.get('/users', adminProtect, async (req, res, next) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    // Add boarding count per user
    const usersWithCount = await Promise.all(
      users.map(async (u) => {
        const boardingCount = await Boarding.countDocuments({ owner: u._id });
        return { ...u.toObject(), boardingCount };
      })
    );
    res.json({ success: true, users: usersWithCount });
  } catch (err) { next(err); }
});

// ── GET /api/admin/users/:id ─────────────────
router.get('/users/:id', adminProtect, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const boardings = await Boarding.find({ owner: req.params.id }).sort({ createdAt: -1 });
    res.json({ success: true, user, boardings });
  } catch (err) { next(err); }
});

// ── DELETE /api/admin/users/:id ──────────────
router.delete('/users/:id', adminProtect, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.isAdmin) return res.status(400).json({ success: false, message: 'Cannot delete an admin account' });
    await Boarding.deleteMany({ owner: req.params.id });
    await user.deleteOne();
    res.json({ success: true, message: 'User and their listings deleted' });
  } catch (err) { next(err); }
});

// ── PATCH /api/admin/users/:id/toggle-admin ──
router.patch('/users/:id/toggle-admin', adminProtect, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isAdmin = !user.isAdmin;
    await user.save();
    res.json({ success: true, message: `User is now ${user.isAdmin ? 'an admin' : 'a regular user'}`, isAdmin: user.isAdmin });
  } catch (err) { next(err); }
});

// ── GET /api/admin/boardings ─────────────────
router.get('/boardings', adminProtect, async (req, res, next) => {
  try {
    const boardings = await Boarding.find()
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, boardings });
  } catch (err) { next(err); }
});

// ── DELETE /api/admin/boardings/:id ──────────
router.delete('/boardings/:id', adminProtect, async (req, res, next) => {
  try {
    const boarding = await Boarding.findById(req.params.id);
    if (!boarding) return res.status(404).json({ success: false, message: 'Boarding not found' });
    await boarding.deleteOne();
    res.json({ success: true, message: 'Boarding deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
