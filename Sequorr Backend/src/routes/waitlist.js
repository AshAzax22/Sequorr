const express = require('express');
const router = express.Router();

const Waitlist = require('../models/Waitlist');
const adminAuth = require('../middleware/adminAuth');
const { validateWaitlist } = require('../middleware/validate');
const { sendWaitlistWelcome } = require('../services/emailService');

// ──────────────────────────────────────────────
// PUBLIC — Submit a waitlist signup
// POST /api/waitlist
// ──────────────────────────────────────────────
router.post('/', validateWaitlist, async (req, res) => {
  try {
    const { email, description, usualMoveTime } = req.body;

    const entry = await Waitlist.create({
      email: email.trim().toLowerCase(),
      description: description.trim(),
      usualMoveTime: usualMoveTime.trim(),
    });

    // Send welcome email (fire-and-forget — don't block the response)
    sendWaitlistWelcome(entry.email).catch(() => {});

    return res.status(201).json({
      success: true,
      message: 'You have been added to the waitlist! 🎉',
      data: {
        id: entry._id,
        email: entry.email,
      },
    });
  } catch (error) {
    // Duplicate email (MongoDB unique-index error code 11000)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This email is already on the waitlist',
      });
    }

    console.error('Waitlist POST error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.',
    });
  }
});

// ──────────────────────────────────────────────
// ADMIN — Get all waitlist signups
// GET /api/waitlist/admin
// ──────────────────────────────────────────────
router.get('/admin', adminAuth, async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 50, 1), 200);
    const skip = (page - 1) * limit;

    const [entries, total] = await Promise.all([
      Waitlist.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Waitlist.countDocuments(),
    ]);

    return res.json({
      success: true,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: entries,
    });
  } catch (error) {
    console.error('Admin GET error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve waitlist data',
    });
  }
});

// ──────────────────────────────────────────────
// ADMIN — Delete a waitlist entry
// DELETE /api/waitlist/admin/:id
// ──────────────────────────────────────────────
router.delete('/admin/:id', adminAuth, async (req, res) => {
  try {
    const entry = await Waitlist.findByIdAndDelete(req.params.id);
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Waitlist entry not found' });
    }

    return res.json({
      success: true,
      message: 'Waitlist entry deleted successfully',
    });
  } catch (error) {
    console.error('Waitlist delete error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete waitlist entry',
    });
  }
});

// ──────────────────────────────────────────────
// ADMIN — Aggregated stats
// GET /api/admin/waitlist/stats
// ──────────────────────────────────────────────
router.get('/admin/stats', adminAuth, async (req, res) => {
  try {
    const [total, byDescription, byMoveTime] = await Promise.all([
      Waitlist.countDocuments(),
      Waitlist.aggregate([
        { $group: { _id: '$description', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Waitlist.aggregate([
        { $group: { _id: '$usualMoveTime', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    return res.json({
      success: true,
      total,
      byDescription,
      byMoveTime,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve stats',
    });
  }
});

module.exports = router;
