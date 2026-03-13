// removed ALLOWED_TAGS import

/**
 * Strip HTML tags from a string to prevent stored XSS.
 * @param {string} str
 * @returns {string}
 */
function stripHtml(str) {
  return str.replace(/<[^>]*>/g, '');
}

/**
 * Validates the blog creation / update request body.
 */
const validateBlog = (req, res, next) => {
  const { title, sections, tags, coverImage, thumbnailImage } = req.body;
  const errors = [];

  // ── title ──
  if (!title || typeof title !== 'string' || !title.trim()) {
    errors.push('Blog title is required');
  } else if (title.trim().length > 300) {
    errors.push('Title must be 300 characters or fewer');
  } else {
    req.body.title = stripHtml(title);
  }

  // ── optional images (root) ──
  if (coverImage && typeof coverImage === 'string') {
    req.body.coverImage = stripHtml(coverImage);
  }
  if (thumbnailImage && typeof thumbnailImage === 'string') {
    req.body.thumbnailImage = stripHtml(thumbnailImage);
  }

  // ── sections ──
  if (!sections || !Array.isArray(sections) || sections.length === 0) {
    errors.push('At least one content section is required');
  } else {
    sections.forEach((s, i) => {
      if (!s.subHeading || typeof s.subHeading !== 'string' || !s.subHeading.trim()) {
        errors.push(`Section ${i + 1}: sub-heading is required`);
      } else {
        s.subHeading = stripHtml(s.subHeading);
      }
      if (!s.content || typeof s.content !== 'string' || !s.content.trim()) {
        errors.push(`Section ${i + 1}: content is required`);
      } else {
        s.content = stripHtml(s.content);
      }
      if (s.imageUrl && typeof s.imageUrl === 'string') {
        s.imageUrl = stripHtml(s.imageUrl);
      }
      if (s.imageCaption && typeof s.imageCaption === 'string') {
        s.imageCaption = stripHtml(s.imageCaption);
      }
    });
  }

  // ── tags ──
  if (tags) {
    if (!Array.isArray(tags)) {
      errors.push('Tags must be an array');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};

module.exports = validateBlog;
