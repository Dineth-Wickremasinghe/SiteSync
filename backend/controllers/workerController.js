const Worker = require('../models/Worker')

// @POST /api/workers
const createWorker = async (req, res) => {
  try {
    const { name, phone, trade, status } = req.body

    const worker = await Worker.create({
      name,
      phone,
      trade,
      status,
      idPhotoUrl: req.file ? req.file.path : '',
      createdBy: req.user.id
    })

    res.status(201).json(worker)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @GET /api/workers
const getWorkers = async (req, res) => {
  try {
    const workers = await Worker.find().populate('createdBy', 'name email')
    res.json(workers)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @GET /api/workers/:id
const getWorkerById = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id).populate('createdBy', 'name email')
    if (!worker) return res.status(404).json({ message: 'Worker not found' })
    res.json(worker)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @PUT /api/workers/:id
const updateWorker = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id)
    if (!worker) return res.status(404).json({ message: 'Worker not found' })

    worker.name   = req.body.name   || worker.name
    worker.phone  = req.body.phone  || worker.phone
    worker.trade  = req.body.trade  || worker.trade
    worker.status = req.body.status || worker.status

    if (req.file) worker.idPhotoUrl = req.file.path

    const updated = await worker.save()
    res.json(updated)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @DELETE /api/workers/:id
const deleteWorker = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id)
    if (!worker) return res.status(404).json({ message: 'Worker not found' })

    await worker.deleteOne()
    res.json({ message: 'Worker deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = { createWorker, getWorkers, getWorkerById, updateWorker, deleteWorker }