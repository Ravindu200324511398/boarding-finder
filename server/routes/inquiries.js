// const express = require('express');
// const router = express.Router();
// const Inquiry = require('../models/Inquiry');
// const Boarding = require('../models/Boarding');
// const { protect } = require('../middleware/auth');

// // Student sends inquiry
// router.post('/:boardingId', async (req, res, next) => {
//   try {
//     const boarding = await Boarding.findById(req.params.boardingId);
//     if (!boarding) return res.status(404).json({ success: false, message: 'Boarding not found' });

//     const { name, email, phone, visitDate, message } = req.body;
//     if (!name || !email || !message)
//       return res.status(400).json({ success: false, message: 'Name, email, and message are required' });

//     // Try to get student from auth header if logged in
//     let studentId = null;
//     try {
//       const jwt = require('jsonwebtoken');
//       const authHeader = req.headers.authorization;
//       if (authHeader && authHeader.startsWith('Bearer ')) {
//         const token = authHeader.split(' ')[1];
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         studentId = decoded.id;
//       }
//     } catch {}

//     const inquiry = await Inquiry.create({
//       boarding: boarding._id,
//       owner: boarding.owner,
//       student: studentId,
//       name, email, phone, visitDate, message,
//     });

//     res.status(201).json({ success: true, message: 'Inquiry sent successfully!', inquiry });
//   } catch (err) { next(err); }
// });


// // Student gets their own inquiries
// router.get('/student/mine', protect, async (req, res, next) => {
//   try {
//     const inquiries = await Inquiry.find({ student: req.user.id })
//       .populate('boarding', 'title location image isAvailable roomType price')
//       .populate('owner', 'name email')
//       .sort({ createdAt: -1 });
//     res.json({ success: true, inquiries });
//   } catch (err) { next(err); }
// });

// // Owner gets all inquiries for their listings
// router.get('/owner/all', protect, async (req, res, next) => {
//   try {
//     const inquiries = await Inquiry.find({ owner: req.user.id })
//       .populate('boarding', 'title location image')
//       .sort({ createdAt: -1 });
//     res.json({ success: true, inquiries });
//   } catch (err) { next(err); }
// });

// // Owner gets inquiries for a specific listing
// router.get('/boarding/:boardingId', protect, async (req, res, next) => {
//   try {
//     const boarding = await Boarding.findById(req.params.boardingId);
//     if (!boarding) return res.status(404).json({ success: false, message: 'Not found' });
//     if (boarding.owner.toString() !== req.user.id)
//       return res.status(403).json({ success: false, message: 'Not authorized' });

//     const inquiries = await Inquiry.find({ boarding: req.params.boardingId })
//       .sort({ createdAt: -1 });
//     res.json({ success: true, inquiries });
//   } catch (err) { next(err); }
// });

// // Owner updates inquiry status
// router.patch('/:id/status', protect, async (req, res, next) => {
//   try {
//     const inquiry = await Inquiry.findById(req.params.id);
//     if (!inquiry) return res.status(404).json({ success: false, message: 'Not found' });
//     if (inquiry.owner.toString() !== req.user.id)
//       return res.status(403).json({ success: false, message: 'Not authorized' });

//     inquiry.status = req.body.status;
//     await inquiry.save();
//     res.json({ success: true, inquiry });
//   } catch (err) { next(err); }
// });

// // Owner OR student deletes inquiry
// router.delete('/:id', protect, async (req, res, next) => {
//   try {
//     const inquiry = await Inquiry.findById(req.params.id);
//     if (!inquiry) return res.status(404).json({ success: false, message: 'Not found' });
//     const isOwner = inquiry.owner.toString() === req.user.id;
//     const isStudent = inquiry.student && inquiry.student.toString() === req.user.id;
//     if (!isOwner && !isStudent)
//       return res.status(403).json({ success: false, message: 'Not authorized' });
//     await inquiry.deleteOne();
//     res.json({ success: true, message: 'Inquiry deleted' });
//   } catch (err) { next(err); }
// });


// // Owner bulk delete by status
// router.delete('/owner/bulk', protect, async (req, res, next) => {
//   try {
//     const { status } = req.body;
//     const filter = { owner: req.user.id };
//     if (status && status !== 'all') filter.status = status;
//     const result = await Inquiry.deleteMany(filter);
//     res.json({ success: true, deleted: result.deletedCount });
//   } catch (err) { next(err); }
// });

// // Student bulk delete by status
// router.delete('/student/bulk', protect, async (req, res, next) => {
//   try {
//     const { status } = req.body;
//     const filter = { student: req.user.id };
//     if (status && status !== 'all') filter.status = status;
//     const result = await Inquiry.deleteMany(filter);
//     res.json({ success: true, deleted: result.deletedCount });
//   } catch (err) { next(err); }
// });

// module.exports = router;


const express = require('express');
const router = express.Router();
const Inquiry = require('../models/Inquiry');
const Boarding = require('../models/Boarding');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// Student sends inquiry
router.post('/:boardingId', async (req, res, next) => {
  try {
    const boarding = await Boarding.findById(req.params.boardingId);
    if (!boarding) return res.status(404).json({ success: false, message: 'Boarding not found' });

    const { name, email, phone, visitDate, message } = req.body;
    if (!name || !email || !message)
      return res.status(400).json({ success: false, message: 'Name, email, and message are required' });

    // Try to get student from auth header if logged in
    let studentId = null;
    try {
      const jwt = require('jsonwebtoken');
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        studentId = decoded.id;
      }
    } catch {}

    const inquiry = await Inquiry.create({
      boarding: boarding._id,
      owner: boarding.owner,
      student: studentId,
      name, email, phone, visitDate, message,
    });

    // 🔔 Notify owner about new inquiry
    try {
      await Notification.create({
        recipient: boarding.owner,
        sender:    studentId || null,
        type:      'inquiry_received',
        message:   `New visit request for "${boarding.title}" from ${name} 📬`,
        inquiry:   inquiry._id,
        boarding:  boarding._id,
      });
    } catch {}

    res.status(201).json({ success: true, message: 'Inquiry sent successfully!', inquiry });
  } catch (err) { next(err); }
});


// Student gets their own inquiries
router.get('/student/mine', protect, async (req, res, next) => {
  try {
    const inquiries = await Inquiry.find({ student: req.user.id })
      .populate('boarding', 'title location image isAvailable roomType price')
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, inquiries });
  } catch (err) { next(err); }
});

// Owner gets all inquiries for their listings
router.get('/owner/all', protect, async (req, res, next) => {
  try {
    const inquiries = await Inquiry.find({ owner: req.user.id })
      .populate('boarding', 'title location image')
      .sort({ createdAt: -1 });
    res.json({ success: true, inquiries });
  } catch (err) { next(err); }
});

// Owner gets inquiries for a specific listing
router.get('/boarding/:boardingId', protect, async (req, res, next) => {
  try {
    const boarding = await Boarding.findById(req.params.boardingId);
    if (!boarding) return res.status(404).json({ success: false, message: 'Not found' });
    if (boarding.owner.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: 'Not authorized' });

    const inquiries = await Inquiry.find({ boarding: req.params.boardingId })
      .sort({ createdAt: -1 });
    res.json({ success: true, inquiries });
  } catch (err) { next(err); }
});

// Owner updates inquiry status
router.patch('/:id/status', protect, async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id)
      .populate('boarding', 'title')
      .populate('student', 'name');

    if (!inquiry) return res.status(404).json({ success: false, message: 'Not found' });
    if (inquiry.owner.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: 'Not authorized' });

    const { status } = req.body;
    inquiry.status = status;
    await inquiry.save();

    // 🔔 Notify student about status change
    if (inquiry.student) {
      const notifMessages = {
        accepted: `Your visit request for "${inquiry.boarding?.title}" has been accepted! 🎉`,
        rejected: `Your visit request for "${inquiry.boarding?.title}" was declined.`,
        seen:     `Your visit request for "${inquiry.boarding?.title}" has been reviewed. 👁️`,
      };

      const notifTypes = {
        accepted: 'inquiry_accepted',
        rejected: 'inquiry_declined',
        seen:     'inquiry_reviewed',
      };

      if (notifMessages[status]) {
        try {
          await Notification.create({
            recipient: inquiry.student._id,
            sender:    req.user.id,
            type:      notifTypes[status],
            message:   notifMessages[status],
            inquiry:   inquiry._id,
            boarding:  inquiry.boarding?._id,
          });
        } catch {}
      }
    }

    res.json({ success: true, inquiry });
  } catch (err) { next(err); }
});

// Owner OR student deletes inquiry
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) return res.status(404).json({ success: false, message: 'Not found' });
    const isOwner   = inquiry.owner.toString() === req.user.id;
    const isStudent = inquiry.student && inquiry.student.toString() === req.user.id;
    if (!isOwner && !isStudent)
      return res.status(403).json({ success: false, message: 'Not authorized' });
    await inquiry.deleteOne();
    res.json({ success: true, message: 'Inquiry deleted' });
  } catch (err) { next(err); }
});

// Owner bulk delete by status
router.delete('/owner/bulk', protect, async (req, res, next) => {
  try {
    const { status } = req.body;
    const filter = { owner: req.user.id };
    if (status && status !== 'all') filter.status = status;
    const result = await Inquiry.deleteMany(filter);
    res.json({ success: true, deleted: result.deletedCount });
  } catch (err) { next(err); }
});

// Student bulk delete by status
router.delete('/student/bulk', protect, async (req, res, next) => {
  try {
    const { status } = req.body;
    const filter = { student: req.user.id };
    if (status && status !== 'all') filter.status = status;
    const result = await Inquiry.deleteMany(filter);
    res.json({ success: true, deleted: result.deletedCount });
  } catch (err) { next(err); }
});

module.exports = router;