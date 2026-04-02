const Project = require('../models/Project')

// @POST /api/projects
const createProject = async (req, res) => {
  try {
    const { projectName, location, clientName, status } = req.body

    if (!projectName || !location || !clientName) {
      return res.status(400).json({ message: 'projectName, location and clientName are required' })
    }

    const project = await Project.create({
      projectName,
      location,
      clientName,
      status: status || 'Active',
      blueprintImage: req.file ? req.file.path : '',
      createdBy: req.user.id
    })

    res.status(201).json(project)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @GET /api/projects
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find().populate('createdBy', 'name email')
    res.json(projects)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @GET /api/projects/:id
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('createdBy', 'name email')
    if (!project) return res.status(404).json({ message: 'Project not found' })
    res.json(project)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @PUT /api/projects/:id
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) return res.status(404).json({ message: 'Project not found' })

    project.projectName  = req.body.projectName  || project.projectName
    project.location     = req.body.location     || project.location
    project.clientName   = req.body.clientName   || project.clientName
    project.status       = req.body.status       || project.status

    if (req.file) project.blueprintImage = req.file.path

    const updated = await project.save()
    res.json(updated)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @DELETE /api/projects/:id
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) return res.status(404).json({ message: 'Project not found' })

    await project.deleteOne()
    res.json({ message: 'Project deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = { createProject, getProjects, getProjectById, updateProject, deleteProject }