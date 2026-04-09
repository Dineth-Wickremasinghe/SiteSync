const express = require('express')
const router = express.Router()
const {
  createIncident,
  getIncidents,
  getIncidentById,
  updateIncident,
  deleteIncident
} = require('../controllers/incidentController')
const { protect } = require('../middleware/authMiddleware')
const upload = require('../middleware/uploadMiddleware')

router.post('/',      protect, upload.single('incidentImg'), createIncident)
router.get('/',       protect, getIncidents)
router.get('/:id',    protect, getIncidentById)
router.put('/:id',    protect, upload.single('incidentImg'), updateIncident)
router.delete('/:id', protect, deleteIncident)

module.exports = router