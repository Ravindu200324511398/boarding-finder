const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Boarding = require('../models/Boarding');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'favorites',
      populate: { path: 'owner', select: 'name email' },
    });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, favorites: user.favorites });
  } catch (err) {
    next(err);
  }
});

router.post('/:boardingId', protect, async (req, res, next) => {
  try {
    const { boardingId } = req.params;
    const boarding = await Boarding.findById(boardingId);
    if (!boarding) {
      return res.status(404).json({ success: false, message: 'Boarding not found' });
    }
    const user = await User.findById(req.user.id);
    if (user.favorites.includes(boardingId)) {
      return res.status(400).json({ success: false, message: 'Already in favorites' });
    }
    user.favorites.push(boardingId);
    await user.save();
    res.json({ success: true, message: 'Added to favorites' });
  } catch (err) {
    next(err);
  }
});

router.delete('/:boardingId', protect, async (req, res, next) => {
  try {
    const { boardingId } = req.params;
    const user = await User.findById(req.user.id);
    user.favorites = user.favorites.filter((fav) => fav.toString() !== boardingId);
    await user.save();
    res.json({ success: true, message: 'Removed from favorites' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;