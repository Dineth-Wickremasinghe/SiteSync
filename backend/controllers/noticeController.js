const Notice = require('../models/Notice');

// POST /api/notices — Create a notice (Admin only)
const createNotice = async (req, res) => {
  try {
    const { title, message, category, postedBy, noticeImage } = req.body;
    const notice = await Notice.create({
      title,
      message,
      category,
      postedBy,
      noticeImage: noticeImage || '',
      createdBy: req.user.id, // comes from authMiddleware
    });
    res.status(201).json(notice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/notices — Get all notices
const getAllNotices = async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 });
    res.json(notices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/notices/:id — Get one notice
const getNoticeById = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) return res.status(404).json({ message: 'Notice not found' });
    res.json(notice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/notices/:id — Update a notice
const updateNotice = async (req, res) => {
  try {
    const notice = await Notice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!notice) return res.status(404).json({ message: 'Notice not found' });
    res.json(notice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/notices/:id — Delete a notice
const deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id);
    if (!notice) return res.status(404).json({ message: 'Notice not found' });
    res.json({ message: 'Notice deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createNotice, getAllNotices, getNoticeById, updateNotice, deleteNotice };