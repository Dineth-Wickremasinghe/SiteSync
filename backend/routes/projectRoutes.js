const express = require('express')
const router = express.Router()
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject
} = require('../controllers/projectController')
const { protect } = require('../middleware/authMiddleware')
const upload = require('../middleware/uploadMiddleware')

router.post('/',      protect, upload.single('blueprintImage'), createProject)
router.get('/',       protect, getProjects)
router.get('/:id',    protect, getProjectById)
router.put('/:id',    protect, upload.single('blueprintImage'), updateProject)
router.delete('/:id', protect, deleteProject)

module.exports = router