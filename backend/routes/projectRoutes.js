const express = require('express')
const router = express.Router()
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectStats,
  searchProjects,
  getProjectsByStatus
} = require('../controllers/projectController')
const { protect } = require('../middleware/authMiddleware')
const upload = require('../middleware/uploadMiddleware')

// Existing routes
router.post('/', protect, upload.single('blueprintImage'), createProject)
router.get('/', protect, getProjects)
router.get('/stats', protect, getProjectStats)
router.get('/search', protect, searchProjects)
router.get('/status/:status', protect, getProjectsByStatus)
router.get('/:id', protect, getProjectById)
router.put('/:id', protect, upload.single('blueprintImage'), updateProject)
router.delete('/:id', protect, deleteProject)

module.exports = router