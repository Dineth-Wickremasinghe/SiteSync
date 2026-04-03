const Incident = require('../models/Incident')

// @POST /api/incidents
const createIncident = async (req, res) => {
  try {
    const { title, description, severity, status } = req.body

    const incident = await Incident.create({
      title,
      description,
      severity,
      status,
      incidentImg: req.file ? req.file.path : '',
      createdBy: req.user.id
    })

    res.status(201).json(incident)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @GET /api/incidents
const getIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
    res.json(incidents)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @GET /api/incidents/:id
const getIncidentById = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id)
      .populate('createdBy', 'name email')
    if (!incident) return res.status(404).json({ message: 'Incident not found' })
    res.json(incident)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @PUT /api/incidents/:id
const updateIncident = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id)
    if (!incident) return res.status(404).json({ message: 'Incident not found' })

    incident.title       = req.body.title       || incident.title
    incident.description = req.body.description || incident.description
    incident.severity    = req.body.severity    || incident.severity
    incident.status      = req.body.status      || incident.status
    if (req.file) incident.incidentImg = req.file.path

    const updated = await incident.save()
    res.json(updated)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @DELETE /api/incidents/:id
const deleteIncident = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id)
    if (!incident) return res.status(404).json({ message: 'Incident not found' })

    await incident.deleteOne()
    res.json({ message: 'Incident deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = { createIncident, getIncidents, getIncidentById, updateIncident, deleteIncident }