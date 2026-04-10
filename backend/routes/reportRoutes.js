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

// All routes are protected — a valid JWT Bearer token is required
router.post('/', protect, upload.single('reportPhoto'), createReport)
router.get('/', protect, getReports)
router.get('/:id', protect, getReportById)
router.put('/:id', protect, upload.single('reportPhoto'), updateReport)
router.delete('/:id', protect, deleteReport)

module.exports = router