const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createNotice,
  getAllNotices,
  getNoticeById,
  updateNotice,
  deleteNotice,
} = require('../controllers/noticeController');

router.post('/',     protect, createNotice);
router.get('/',      protect, getAllNotices);
router.get('/:id',   protect, getNoticeById);
router.put('/:id',   protect, updateNotice);
router.delete('/:id', protect, deleteNotice);

module.exports = router;