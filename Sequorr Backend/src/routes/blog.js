const express = require('express');
const router = express.Router();

const { Blog, ALLOWED_TAGS } = require('../models/Blog');
const adminAuth = require('../middleware/adminAuth');
const validateBlog = require('../middleware/validateBlog');

// ──────────────────────────────────────────────
// PUBLIC — Get available tags
// GET /api/blog/tags
// ──────────────────────────────────────────────
router.get('/tags', (_req, res) => {
  res.json({ success: true, tags: ALLOWED_TAGS });
});

// ──────────────────────────────────────────────
// PUBLIC — List blogs (paginated, filterable, sortable)
// GET /api/blog
//   ?page=1&limit=10
//   &tags=cardio,nutrition      (comma-separated)
//   &sort=latest|oldest|most-read
//   &search=keyword
// ──────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);
    const skip = (page - 1) * limit;

    // Build filter
    const filter = { published: true };

    // Tag filter
    if (req.query.tags) {
      const tagList = req.query.tags.split(',').map((t) => t.trim().toLowerCase());
      filter.tags = { $in: tagList };
    }

    // Text search on title
    if (req.query.search) {
      filter.title = { $regex: req.query.search.trim(), $options: 'i' };
    }

    // Sort
    let sort = { createdAt: -1 }; // default: latest
    if (req.query.sort === 'oldest') {
      sort = { createdAt: 1 };
    } else if (req.query.sort === 'most-read') {
      sort = { readCount: -1, createdAt: -1 };
    }

    const [blogs, total] = await Promise.all([
      Blog.find(filter)
        .select('title slug tags averageReadTime readCount createdAt')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Blog.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: blogs,
    });
  } catch (error) {
    console.error('Blog list error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve blogs' });
  }
});

// ──────────────────────────────────────────────
// ADMIN — Get Dashboard Stats
// GET /api/blog/admin/stats
// ──────────────────────────────────────────────
router.get('/admin/stats', adminAuth, async (req, res) => {
  try {
    const stats = await Blog.aggregate([
      {
        $group: {
          _id: null,
          totalBlogs: { $sum: 1 },
          totalPublished: { $sum: { $cond: [{ $eq: ["$published", true] }, 1, 0] } },
          totalDrafts: { $sum: { $cond: [{ $eq: ["$published", false] }, 1, 0] } },
          totalReads: { $sum: "$readCount" }
        }
      }
    ]);

    const result = stats.length > 0 ? stats[0] : { totalBlogs: 0, totalPublished: 0, totalDrafts: 0, totalReads: 0 };
    delete result._id;

    return res.json({ success: true, data: result });
  } catch (error) {
    console.error('Stats error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve stats' });
  }
});

// ──────────────────────────────────────────────
// ADMIN — List all blogs (including unpublished drafts)
// GET /api/blog/admin
// ──────────────────────────────────────────────
router.get('/admin', adminAuth, async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
    const skip = (page - 1) * limit;

    const filter = {};

    // Optional published filter
    if (req.query.published === 'true') filter.published = true;
    if (req.query.published === 'false') filter.published = false;

    // Tag filter
    if (req.query.tags) {
      const tagList = req.query.tags.split(',').map((t) => t.trim().toLowerCase());
      filter.tags = { $in: tagList };
    }

    // Search
    if (req.query.search) {
      filter.title = { $regex: req.query.search.trim(), $options: 'i' };
    }

    // Sort
    let sort = { createdAt: -1 };
    if (req.query.sort === 'oldest') sort = { createdAt: 1 };
    else if (req.query.sort === 'most-read') sort = { readCount: -1, createdAt: -1 };

    const [blogs, total] = await Promise.all([
      Blog.find(filter)
        .select('title slug tags averageReadTime readCount published createdAt updatedAt')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Blog.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: blogs,
    });
  } catch (error) {
    console.error('Admin blog list error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve blogs' });
  }
});

// ──────────────────────────────────────────────
// ADMIN — Get single blog by ID
// GET /api/blog/admin/:id
// ──────────────────────────────────────────────
router.get('/admin/:id', adminAuth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    return res.json({ success: true, data: blog });
  } catch (error) {
    console.error('Admin get blog error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve blog' });
  }
});

// ──────────────────────────────────────────────
// PUBLIC — Get single blog by slug (must be AFTER /admin and /tags)
// GET /api/blog/:slug
// ──────────────────────────────────────────────
router.get('/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOneAndUpdate(
      { slug: req.params.slug, published: true },
      { $inc: { readCount: 1 } },
      { new: true }
    );

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    return res.json({ success: true, data: blog });
  } catch (error) {
    console.error('Blog detail error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve blog' });
  }
});

// ──────────────────────────────────────────────
// ADMIN — Create a blog post
// POST /api/blog
// ──────────────────────────────────────────────
router.post('/', adminAuth, validateBlog, async (req, res) => {
  try {
    const { title, sections, tags, published, coverImage, thumbnailImage } = req.body;

    const blog = await Blog.create({
      title: title.trim(),
      sections,
      tags: tags || [],
      published: published !== undefined ? published : true,
      coverImage,
      thumbnailImage,
    });

    return res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: blog,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A blog with a similar title already exists',
      });
    }
    console.error('Blog create error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create blog' });
  }
});

// ──────────────────────────────────────────────
// ADMIN — Update a blog post
// PUT /api/blog/:id
// ──────────────────────────────────────────────
router.put('/:id', adminAuth, validateBlog, async (req, res) => {
  try {
    const { title, sections, tags, published, coverImage, thumbnailImage } = req.body;

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    blog.title = title.trim();
    blog.sections = sections;
    if (tags) blog.tags = tags;
    if (published !== undefined) blog.published = published;
    if (coverImage !== undefined) blog.coverImage = coverImage;
    if (thumbnailImage !== undefined) blog.thumbnailImage = thumbnailImage;

    await blog.save(); // triggers pre-validate hooks (slug, readTime)

    return res.json({
      success: true,
      message: 'Blog updated successfully',
      data: blog,
    });
  } catch (error) {
    console.error('Blog update error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update blog' });
  }
});

// ──────────────────────────────────────────────
// ADMIN — Delete a blog post
// DELETE /api/blog/:id
// ──────────────────────────────────────────────
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    return res.json({
      success: true,
      message: 'Blog deleted successfully',
    });
  } catch (error) {
    console.error('Blog delete error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete blog' });
  }
});

module.exports = router;
