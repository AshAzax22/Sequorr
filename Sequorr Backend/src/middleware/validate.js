/**
 * Validates the waitlist signup request body.
 */
const validateWaitlist = (req, res, next) => {
  const { email, description, usualMoveTime } = req.body;
  const errors = [];

  // --- email ---
  if (!email || typeof email !== 'string' || !email.trim()) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.push('Please provide a valid email address');
  }

  // --- description ---
  if (!description || typeof description !== 'string' || !description.trim()) {
    errors.push('"What describes you best" is required');
  } else if (description.trim().length > 200) {
    errors.push('Description must be 200 characters or fewer');
  }

  // --- usualMoveTime ---
  if (!usualMoveTime || typeof usualMoveTime !== 'string' || !usualMoveTime.trim()) {
    errors.push('"When do you usually move" is required');
  } else if (usualMoveTime.trim().length > 200) {
    errors.push('Move-time answer must be 200 characters or fewer');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};

module.exports = validateWaitlist;
