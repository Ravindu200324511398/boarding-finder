const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Boarding = require('../models/Boarding');
const { protect } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `boarding_${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, WEBP images are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/', async (req, res, next) => {
  try {
    const { location, minPrice, maxPrice, search, roomType } = req.query;
    let filter = {};
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (roomType) filter.roomType = roomType;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }
    const boardings = await Boarding.find(filter)
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: boardings.length, boardings });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const boarding = await Boarding.findById(req.params.id).populate('owner', 'name email');
    if (!boarding) {
      return res.status(404).json({ success: false, message: 'Boarding not found' });
    }
    res.json({ success: true, boarding });
  } catch (err) {
    next(err);
  }
});

router.post('/', protect, upload.single('image'), async (req, res, next) => {
  try {
    const { title, description, price, location, lat, lng, roomType, amenities, contact } = req.body;
    if (!title || !description || !price || !location) {
      return res.status(400).json({ success: false, message: 'Title, description, price, and location are required' });
    }
    const boardingData = {
      title,
      description,
      price: Number(price),
      location,
      lat: lat ? Number(lat) : null,
      lng: lng ? Number(lng) : null,
      roomType: roomType || 'Single',
      amenities: amenities ? amenities.split(',').map((a) => a.trim()) : [],
      contact: contact || '',
      owner: req.user.id,
    };
    if (req.file) boardingData.image = req.file.filename;
    const boarding = await Boarding.create(boardingData);
    res.status(201).json({ success: true, message: 'Boarding added successfully', boarding });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', protect, upload.single('image'), async (req, res, next) => {
  try {
    const boarding = await Boarding.findById(req.params.id);
    if (!boarding) {
      return res.status(404).json({ success: false, message: 'Boarding not found' });
    }
    if (boarding.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this boarding' });
    }
    const { title, description, price, location, lat, lng, roomType, amenities, contact } = req.body;
    if (title) boarding.title = title;
    if (description) boarding.description = description;
    if (price) boarding.price = Number(price);
    if (location) boarding.location = location;
    if (lat) boarding.lat = Number(lat);
    if (lng) boarding.lng = Number(lng);
    if (roomType) boarding.roomType = roomType;
    if (amenities) boarding.amenities = amenities.split(',').map((a) => a.trim());
    if (contact) boarding.contact = contact;
    if (req.file) boarding.image = req.file.filename;
    await boarding.save();
    res.json({ success: true, message: 'Boarding updated', boarding });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', protect, async (req, res, next) => {
  try {
    const boarding = await Boarding.findById(req.params.id);
    if (!boarding) {
      return res.status(404).json({ success: false, message: 'Boarding not found' });
    }
    if (boarding.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this boarding' });
    }
    await boarding.deleteOne();
    res.json({ success: true, message: 'Boarding deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;