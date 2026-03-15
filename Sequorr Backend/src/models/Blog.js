const mongoose = require('mongoose');

// ── Predefined tags removed in favor of Tag collection ──

// ── Section sub-schema ──────────────────────
const sectionSchema = new mongoose.Schema(
  {
    subHeading: {
      type: String,
      required: [true, 'Each section needs a sub-heading'],
      trim: true,
      maxlength: [200, 'Sub-heading must be 200 characters or fewer'],
    },
    content: {
      type: String,
      required: [true, 'Each section needs content'],
      trim: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    imageCaption: {
      type: String,
      trim: true,
      maxlength: [200, 'Image caption must be 200 characters or fewer'],
    },
  },
  { _id: false }
);

// ── Blog schema ─────────────────────────────
const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Blog title is required'],
      trim: true,
      maxlength: [300, 'Title must be 300 characters or fewer'],
    },
    description: {
      type: String,
      required: [true, 'Short description is required'],
      trim: true,
      maxlength: [500, 'Description must be 500 characters or fewer'],
    },
    coverImage: {
      type: String,
      trim: true,
    },
    thumbnailImage: {
      type: String,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    sections: {
      type: [sectionSchema],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'At least one content section is required',
      },
    },
    averageReadTime: {
      type: Number, // minutes
      default: 1,
    },
    tags: {
      type: [String],
      index: true,
    },
    readCount: {
      type: Number,
      default: 0,
    },
    published: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// ── Auto-generate slug from title ───────────
blogSchema.pre('validate', function (next) {
  if (this.title && (!this.slug || this.isModified('title'))) {
    this.slug =
      this.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') +
      '-' +
      Date.now().toString(36);
  }
  next();
});

// ── Auto-calculate read time from sections ──
blogSchema.pre('validate', function (next) {
  if (this.sections && this.sections.length > 0) {
    const totalWords = this.sections.reduce((sum, s) => {
      const words =
        (s.subHeading ? s.subHeading.split(/\s+/).length : 0) +
        (s.content ? s.content.split(/\s+/).length : 0);
      return sum + words;
    }, 0);
    this.averageReadTime = Math.max(1, Math.ceil(totalWords / 200)); // ~200 wpm
  }
  next();
});

// Export model
const Blog = mongoose.model('Blog', blogSchema);
module.exports = { Blog };
