const Equipment = require('../models/Equipment')

// @POST /api/equipment
const createEquipment = async (req, res) => {
  try {
    const { name, type, condition, quantity } = req.body

    const equipment = await Equipment.create({
      name,
      type,
      condition,
      quantity,
      equipmentImg: req.file ? req.file.path : '',
      createdBy: req.user.id
    })

    res.status(201).json(equipment)
  } catch (error) {
    console.error('Equipment create error:', error.message)
    res.status(500).json({ message: error.message })
  }
}

// @GET /api/equipment
const getEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.find().populate('createdBy', 'name email')
    res.json(equipment)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @GET /api/equipment/:id
const getEquipmentById = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id).populate('createdBy', 'name email')
    if (!equipment) return res.status(404).json({ message: 'Equipment not found' })
    res.json(equipment)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @PUT /api/equipment/:id
const updateEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id)
    if (!equipment) return res.status(404).json({ message: 'Equipment not found' })

    equipment.name      = req.body.name      || equipment.name
    equipment.type      = req.body.type      || equipment.type
    equipment.condition = req.body.condition || equipment.condition
    equipment.quantity  = req.body.quantity  || equipment.quantity

    if (req.file) equipment.equipmentImg = req.file.path

    const updated = await equipment.save()
    res.json(updated)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @DELETE /api/equipment/:id
const deleteEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id)
    if (!equipment) return res.status(404).json({ message: 'Equipment not found' })

    await equipment.deleteOne()
    res.json({ message: 'Equipment deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = { createEquipment, getEquipment, getEquipmentById, updateEquipment, deleteEquipment }