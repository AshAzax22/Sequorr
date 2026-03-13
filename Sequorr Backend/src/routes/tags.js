const express = require('express');
const router = express.Router();
const Tag = require('../models/Tag');
const adminAuth = require('../middleware/adminAuth');

// ──────────────────────────────────────────────
// PUBLIC — List all tags
// GET /api/tags
// ──────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const tags = await Tag.find().sort({ name: 1 });
    // Keep it compatible with frontend expecting a flat array of strings, or an array of objects
    // Currently the frontend expects `res.tags` to be an array of strings in `getBlogTags`
    // Let's send both the objects, and the flat array of strings for backward compatibility.
    const tagStrings = tags.map(t => t.name);

    return res.json({
      success: true,
      data: tags,
      tags: tagStrings // legacy support for BlogEditor.jsx Dropdown
    });
  } catch (error) {
    console.error('Failed to get tags', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve tags' });
  }
});

// ──────────────────────────────────────────────
// ADMIN — Create a new tag
// POST /api/tags
// ──────────────────────────────────────────────
router.post('/', adminAuth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Tag name is required' });
    }

    const tag = await Tag.create({ name: name.trim() });
    
    return res.status(201).json({
      success: true,
      message: 'Tag created successfully',
      data: tag,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Tag already exists' });
    }
    console.error('Failed to create tag', error);
    return res.status(500).json({ success: false, message: 'Failed to create tag' });
  }
});

module.exports = router;
