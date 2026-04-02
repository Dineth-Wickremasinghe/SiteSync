const mongoose = require('mongoose')

const reportSchema = new mongoose.Schema(
  {
    projectName: {
      type: String,
      required: true
    },
    reportDate: {
      type: String,      // stored as YYYY-MM-DD plain string per schema reference
      required: true
    },
    workDone: {
      type: String,
      required: true
    },
    workerCount: {
      type: Number,
      required: true
    },
    reportPhoto: {
      type: String,
      default: ''        // Cloudinary URL — empty string if no photo uploaded
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }   // adds createdAt and updatedAt automatically
)

module.exports = mongoose.model('Report', reportSchema)
