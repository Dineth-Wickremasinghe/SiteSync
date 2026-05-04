const Project = require('../models/Project')

// ========== HELPER VALIDATION ==========
const validate = (data, isUpdate = false) => {
  const errors = []
  
  if (!isUpdate || data.projectName !== undefined) {
    if (!data.projectName?.trim()) errors.push('Project name is required')
    else if (data.projectName.trim().length < 3) errors.push('Project name must be at least 3 characters')
    else if (data.projectName.trim().length > 100) errors.push('Project name max 100 characters')
  }
  
  if (!isUpdate || data.location !== undefined) {
    if (!data.location?.trim()) errors.push('Location is required')
    else if (data.location.trim().length < 3) errors.push('Location must be at least 3 characters')
  }
  
  if (!isUpdate || data.clientName !== undefined) {
    if (!data.clientName?.trim()) errors.push('Client name is required')
    else if (data.clientName.trim().length < 2) errors.push('Client name must be at least 2 characters')
  }
  
  if (data.status && !['Active', 'On Hold', 'Completed'].includes(data.status)) {
    errors.push('Invalid status value')
  }
  
  return errors
}

// ========== CREATE ==========
const createProject = async (req, res) => {
  try {
    const { projectName, location, clientName, status } = req.body
    
    const errors = validate({ projectName, location, clientName })
    if (errors.length) {
      return res.status(400).json({ message: errors.join(', ') })
    }
    
    // Check duplicate
    const existing = await Project.findOne({
      projectName: { $regex: new RegExp(`^${projectName.trim()}$`, 'i') },
      clientName: { $regex: new RegExp(`^${clientName.trim()}$`, 'i') }
    })
    
    if (existing) {
      return res.status(400).json({ message: 'Project already exists for this client' })
    }
    
    const project = await Project.create({
      projectName: projectName.trim(),
      location: location.trim(),
      clientName: clientName.trim(),
      status: status || 'Active',
      blueprintImage: req.file?.path || '',
      createdBy: req.user.id
    })
    
    await project.populate('createdBy', 'name email')
    res.status(201).json(project)
    
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ========== GET ALL (with search, filter, pagination) ==========
const getProjects = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit
    
    let filter = {}
    
    // Status filter
    if (req.query.status && req.query.status !== 'All') {
      filter.status = req.query.status
    }
    
    // Search functionality
    if (req.query.search) {
      const regex = new RegExp(req.query.search, 'i')
      filter.$or = [
        { projectName: regex },
        { location: regex },
        { clientName: regex }
      ]
    }
    
    const projects = await Project.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
    
    const total = await Project.countDocuments(filter)
    
    res.json({
      projects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
    
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ========== GET BY ID ==========
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
    
    if (!project) return res.status(404).json({ message: 'Project not found' })
    res.json(project)
    
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ========== UPDATE ==========
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) return res.status(404).json({ message: 'Project not found' })
    
    if (req.body.projectName) project.projectName = req.body.projectName.trim()
    if (req.body.location) project.location = req.body.location.trim()
    if (req.body.clientName) project.clientName = req.body.clientName.trim()
    if (req.body.status) project.status = req.body.status
    if (req.file) project.blueprintImage = req.file.path
    
    await project.save()
    await project.populate('createdBy', 'name email')
    res.json(project)
    
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ========== DELETE ==========
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

// ========== STATISTICS (using only existing fields) ==========
const getProjectStats = async (req, res) => {
  try {
    const total = await Project.countDocuments()
    const active = await Project.countDocuments({ status: 'Active' })
    const onHold = await Project.countDocuments({ status: 'On Hold' })
    const completed = await Project.countDocuments({ status: 'Completed' })
    
    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const recentProjects = await Project.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    })
    
    // Get top client
    const topClient = await Project.aggregate([
      { $group: { _id: '$clientName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ])
    
    res.json({
      total,
      active,
      onHold,
      completed,
      recentProjects,
      topClient: topClient[0]?._id || 'None',
      completionRate: total ? Math.round((completed / total) * 100) : 0
    })
    
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ========== SEARCH ==========
const searchProjects = async (req, res) => {
  try {
    const { query } = req.query
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' })
    }
    
    const regex = new RegExp(query.trim(), 'i')
    const projects = await Project.find({
      $or: [
        { projectName: regex },
        { location: regex },
        { clientName: regex }
      ]
    })
    .populate('createdBy', 'name email')
    .limit(20)
    
    res.json(projects)
    
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ========== STATUS FILTER ==========
const getProjectsByStatus = async (req, res) => {
  try {
    const { status } = req.params
    
    if (!['Active', 'On Hold', 'Completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Use: Active, On Hold, Completed' })
    }
    
    const projects = await Project.find({ status })
      .populate('createdBy', 'name email')
    
    res.json(projects)
    
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectStats,
  searchProjects,
  getProjectsByStatus
}