const Report = require('../models/Report')

// ─────────────────────────────────────────────────────────────────────────────
// @POST  /api/reports
// Create a new daily report (with optional photo upload via Cloudinary)
// ─────────────────────────────────────────────────────────────────────────────
const createReport = async (req, res) => {
  try {
    const { projectName, reportDate, workDone, workerCount } = req.body

    const report = await Report.create({
      projectName,
      reportDate,
      workDone,
      workerCount,
      reportPhoto: req.file ? req.file.path : '',   // Cloudinary URL from multer
      createdBy: req.user.id                         // set by authMiddleware
    })

    res.status(201).json(report)
  } catch (error) {
    console.error('Report create error:', error.message)
    res.status(500).json({ message: error.message })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// @GET  /api/reports
// Get all daily reports (newest first)
// ─────────────────────────────────────────────────────────────────────────────
const getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })

    res.json(reports)
  } catch (error) {
    console.error('Get reports error:', error.message)
    res.status(500).json({ message: error.message })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// @GET  /api/reports/:id
// Get a single daily report by its MongoDB _id
// ─────────────────────────────────────────────────────────────────────────────
const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).populate('createdBy', 'name email')

    if (!report) return res.status(404).json({ message: 'Report not found' })

    res.json(report)
  } catch (error) {
    console.error('Get report by id error:', error.message)
    res.status(500).json({ message: error.message })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// @PUT  /api/reports/:id
// Update a daily report (all fields optional; photo updated if new file sent)
// ─────────────────────────────────────────────────────────────────────────────
const updateReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)

    if (!report) return res.status(404).json({ message: 'Report not found' })

    // Only update fields that were sent in the request body
    report.projectName  = req.body.projectName  || report.projectName
    report.reportDate   = req.body.reportDate   || report.reportDate
    report.workDone     = req.body.workDone     || report.workDone
    report.workerCount  = req.body.workerCount  !== undefined ? req.body.workerCount : report.workerCount

    // Replace photo only when a new file is uploaded
    if (req.file) report.reportPhoto = req.file.path

    const updated = await report.save()
    res.json(updated)
  } catch (error) {
    console.error('Update report error:', error.message)
    res.status(500).json({ message: error.message })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// @DELETE  /api/reports/:id
// Delete a daily report by its MongoDB _id
// ─────────────────────────────────────────────────────────────────────────────
const deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)

    if (!report) return res.status(404).json({ message: 'Report not found' })

    await report.deleteOne()
    res.json({ message: 'Report deleted successfully' })
  } catch (error) {
    console.error('Delete report error:', error.message)
    res.status(500).json({ message: error.message })
  }
}

module.exports = { createReport, getReports, getReportById, updateReport, deleteReport }
