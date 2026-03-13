const mongoose = require('mongoose');

const waitlistSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },
    description: {
      type: String,
      required: [true, '"What describes you best" is required'],
      trim: true,
      enum: {
        values: ['Just Starting out', 'staying consistent', 'Training seriously', 'moving for fun'],
        message: '{VALUE} is not a valid description option'
      }
    },
    usualMoveTime: {
      type: String,
      required: [true, '"When do you usually move" is required'],
      trim: true,
      enum: {
        values: ['morning', 'noon', 'evening'],
        message: '{VALUE} is not a valid move time option'
      }
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

module.exports = mongoose.model('Waitlist', waitlistSchema);
