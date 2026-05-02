const express = require('express')
const router = express.Router()

const {
  createReport,
  getReports,
  getReportById,
  updateReport,
  deleteReport
} = require('../controllers/reportController')

const { protect } = require('../middleware/authMiddleware')
const upload = require('../middleware/uploadMiddleware')

// Role-based middleware — only supervisors (and admins) can write reports
const supervisorOnly = (req, res, next) => {
  if (req.user.role === 'supervisor' || req.user.role === 'admin') {
    return next()
  }
  res.status(403).json({ message: 'Access denied. Supervisors only.' })
}

// Workers can view — anyone logged in can GET
router.get('/',    protect, getReports)
router.get('/:id', protect, getReportById)

// Only supervisors can create, update, delete
router.post('/',      protect, supervisorOnly, upload.single('reportPhoto'), createReport)
router.put('/:id',    protect, supervisorOnly, upload.single('reportPhoto'), updateReport)
router.delete('/:id', protect, supervisorOnly, deleteReport)

module.exports = router