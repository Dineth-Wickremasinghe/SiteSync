const mongoose = require('mongoose')

const equipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Heavy', 'Tool', 'Material'],
    required: true
  },
  condition: {
    type: String,
    enum: ['Good', 'Fair', 'Poor'],
    default: 'Good'
  },
  quantity: {
    type: Number,
    required: true
  },
  equipmentImg: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true })

module.exports = mongoose.model('Equipment', equipmentSchema)