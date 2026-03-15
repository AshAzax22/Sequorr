const express = require('express');
const router = express.Router();

const Contact = require('../models/Contact');
const adminAuth = require('../middleware/adminAuth');
const { validateContact } = require('../middleware/validate');
const { sendContactNotification } = require('../services/emailService');

// ──────────────────────────────────────────────
// PUBLIC — Submit a contact form
// POST /api/contact
// ──────────────────────────────────────────────
router.post('/', validateContact, async (req, res) => {
  try {
    const { name, email, reason, message } = req.body;

    const entry = await Contact.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      reason: reason.trim(),
      message: message.trim(),
    });

    // Notify the team (fire-and-forget)
    sendContactNotification(entry).catch(() => {});

    return res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully! We will get back to you soon.',
    });
  } catch (error) {
    console.error('Contact POST error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.',
    });
  }
});

// ──────────────────────────────────────────────
// ADMIN — Get all contact messages
// GET /api/contact/admin
// ──────────────────────────────────────────────
router.get('/admin', adminAuth, async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
    const skip = (page - 1) * limit;

    const [entries, total] = await Promise.all([
      Contact.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Contact.countDocuments(),
    ]);

    return res.json({
      success: true,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: entries,
    });
  } catch (error) {
    console.error('Contact Admin GET error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve contact messages',
    });
  }
});

// ──────────────────────────────────────────────
// ADMIN — Update contact status
// PATCH /api/contact/admin/:id
// ──────────────────────────────────────────────
router.patch('/admin/:id', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['new', 'read', 'responded'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const entry = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!entry) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    return res.json({
      success: true,
      message: 'Status updated successfully',
      data: entry,
    });
  } catch (error) {
    console.error('Contact Admin PATCH error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update status',
    });
  }
});

// ──────────────────────────────────────────────
// ADMIN — Delete a contact message
// DELETE /api/contact/admin/:id
// ──────────────────────────────────────────────
router.delete('/admin/:id', adminAuth, async (req, res) => {
  try {
    const entry = await Contact.findByIdAndDelete(req.params.id);
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    return res.json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    console.error('Contact Admin DELETE error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete message',
    });
  }
});

module.exports = router;
