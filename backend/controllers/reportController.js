const Report = require('../models/Report')

// helper — returns true if the given YYYY-MM-DD string is in the future
const isFutureDate = (dateStr) => {
  const today = new Date()
  today.setHours(23, 59, 59, 999)      // allow any time within today
  const inputDate = new Date(dateStr)
  return inputDate > today
}

// ─────────────────────────────────────────────────────────────────────────────
// @POST  /api/reports
// Create a new daily report (supervisor only — enforced in routes)
// ─────────────────────────────────────────────────────────────────────────────
const createReport = async (req, res) => {
  try {
    const { projectName, reportDate, workDone, workerCount } = req.body

    // Date validation — reject invalid format
    if (!reportDate || isNaN(new Date(reportDate).getTime())) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' })
    }
    // Date validation — reject future dates
    if (isFutureDate(reportDate)) {
      return res.status(400).json({ message: 'Report date cannot be a future date' })
    }

    const report = await Report.create({
      projectName,
      reportDate,
      workDone,
      workerCount,
      reportPhoto: req.file ? req.file.path : '',
      createdBy: req.user.id
    })

    res.status(201).json(report)
  } catch (error) {
    console.error('Report create error:', error.message)
    res.status(500).json({ message: error.message })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// @GET  /api/reports
// Get all daily reports (newest first) — all authenticated users
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
// Get a single daily report — all authenticated users
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
// Update a daily report (supervisor only — enforced in routes)
// ─────────────────────────────────────────────────────────────────────────────
const updateReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)

    if (!report) return res.status(404).json({ message: 'Report not found' })

    // Date validation on update — only check if a new date was sent
    if (req.body.reportDate) {
      if (isNaN(new Date(req.body.reportDate).getTime())) {
        return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' })
      }
      if (isFutureDate(req.body.reportDate)) {
        return res.status(400).json({ message: 'Report date cannot be a future date' })
      }
    }

    report.projectName = req.body.projectName || report.projectName
    report.reportDate  = req.body.reportDate  || report.reportDate
    report.workDone    = req.body.workDone    || report.workDone
    report.workerCount = req.body.workerCount !== undefined ? req.body.workerCount : report.workerCount

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
// Delete a daily report (supervisor only — enforced in routes)
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