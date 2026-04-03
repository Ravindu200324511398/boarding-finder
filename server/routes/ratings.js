const express = require('express');
const router = express.Router();
const Rating = require('../models/Rating');
const { protect } = require('../middleware/auth');

// ── GET /api/ratings/:boardingId ─────────────
// Get all ratings for a boarding
router.get('/:boardingId', async (req, res, next) => {
  try {
    const ratings = await Rating.find({ boarding: req.params.boardingId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    // Calculate average
    const avg = ratings.length
      ? (ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length).toFixed(1)
      : 0;

    res.json({ success: true, ratings, average: Number(avg), total: ratings.length });
  } catch (err) { next(err); }
});

// ── POST /api/ratings/:boardingId ────────────
// Add or update a rating (protected)
router.post('/:boardingId', protect, async (req, res, next) => {
  try {
    // Check if user is the owner of this boarding
    const Boarding = require('../models/Boarding');
    const boarding = await Boarding.findById(req.params.boardingId);
    if (boarding && boarding.owner.toString() === req.user.id) {
      return res.status(403).json({ success: false, message: 'You cannot review your own listing' });
    }
    const { stars, comment } = req.body;
    if (!stars || stars < 1 || stars > 5) {
      return res.status(400).json({ success: false, message: 'Stars must be between 1 and 5' });
    }

    // Upsert — update if exists, create if not
    const rating = await Rating.findOneAndUpdate(
      { boarding: req.params.boardingId, user: req.user.id },
      { stars: Number(stars), comment: comment || '' },
      { new: true, upsert: true, runValidators: true }
    ).populate('user', 'name');

    res.json({ success: true, message: 'Rating saved', rating });
  } catch (err) { next(err); }
});

// ── DELETE /api/ratings/:boardingId ──────────
// Delete your own rating
router.delete('/:boardingId', protect, async (req, res, next) => {
  try {
    await Rating.findOneAndDelete({ boarding: req.params.boardingId, user: req.user.id });
    res.json({ success: true, message: 'Rating deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
