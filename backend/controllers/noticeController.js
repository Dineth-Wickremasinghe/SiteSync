const Notice = require('../models/Notice');

// POST /api/notices — Create a notice (Admin only)
const createNotice = async (req, res) => {
  try {
    const { title, message, category, postedBy } = req.body;
    const notice = await Notice.create({
      title,
      message,
      category,
      postedBy,
      noticeImage: req.file ? req.file.path : '',  // ← reads from req.file not req.body
      createdBy: req.user.id,
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
    const notice = await Notice.findById(req.params.id);
    if (!notice) return res.status(404).json({ message: 'Notice not found' });

    notice.title    = req.body.title    || notice.title;
    notice.message  = req.body.message  || notice.message;
    notice.category = req.body.category || notice.category;
    notice.postedBy = req.body.postedBy || notice.postedBy;
    if (req.file) notice.noticeImage = req.file.path;

    const updated = await notice.save();
    res.json(updated);
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