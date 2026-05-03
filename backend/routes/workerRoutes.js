const express = require('express')
const router = express.Router()
const {
  createWorker,
  getWorkers,
  getWorkerById,
  updateWorker,
  deleteWorker,
  getMyWorkerRecord
} = require('../controllers/workerController')
const { protect } = require('../middleware/authMiddleware')
const upload = require('../middleware/uploadMiddleware')

router.post('/',      protect, upload.single('idPhoto'), createWorker)
router.get('/',       protect, getWorkers)
router.get('/me',     protect, getMyWorkerRecord)
router.get('/:id',    protect, getWorkerById)
router.put('/:id',    protect, upload.single('idPhoto'), updateWorker)
router.delete('/:id', protect, deleteWorker)

module.exports = router