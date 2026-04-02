const mongoose = require('mongoose')

const projectSchema = new mongoose.Schema({
  projectName: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  clientName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'On Hold', 'Completed'],
    default: 'Active'
  },
  blueprintImage: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true })

module.exports = mongoose.model('Project', projectSchema)