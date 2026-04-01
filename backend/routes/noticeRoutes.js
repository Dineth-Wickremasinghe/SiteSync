const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const {
  createNotice,
  getAllNotices,
  getNoticeById,
  updateNotice,
  deleteNotice,
} = require('../controllers/noticeController');

router.post('/',      protect, upload.single('noticeImage'), createNotice);
router.get('/',      protect, getAllNotices);
router.get('/:id',   protect, getNoticeById);
router.put('/:id',    protect, upload.single('noticeImage'), updateNotice);
router.delete('/:id', protect, deleteNotice);

module.exports = router;