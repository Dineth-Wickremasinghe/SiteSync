const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: 'General',
      enum: ['Safety', 'Schedule', 'General'],
    },
    postedBy: {
      type: String,
      required: true, // plain text name, NOT a reference
    },
    noticeImage: {
      type: String,
      default: '',   // Cloudinary URL if image is uploaded
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',   // links to the User collection
    },
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

module.exports = mongoose.model('Notice', noticeSchema);