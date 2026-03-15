const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },
    reason: {
      type: String,
      required: [true, 'Reason for contacting is required'],
      trim: true,
      enum: {
        values: [
          'General Inquiry',
          'Technical Support / Bug Report',
          'Partnership Opportunity',
          'Feedback & Suggestions',
          'Media Inquiry'
        ],
        message: '{VALUE} is not a valid reason option'
      }
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
    },
    status: {
      type: String,
      default: 'new',
      enum: ['new', 'read', 'responded'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Contact', contactSchema);
