const express = require('express')
const router = express.Router()
const {
  createEquipment,
  getEquipment,
  getEquipmentById,
  updateEquipment,
  deleteEquipment
} = require('../controllers/equipmentController')
const { protect } = require('../middleware/authMiddleware')
const upload = require('../middleware/uploadMiddleware')

router.post('/',      protect, upload.single('equipmentImg'), createEquipment)
router.get('/',       protect, getEquipment)
router.get('/:id',    protect, getEquipmentById)
router.put('/:id',    protect, upload.single('equipmentImg'), updateEquipment)
router.delete('/:id', protect, deleteEquipment)

module.exports = router