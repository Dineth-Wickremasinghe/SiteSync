const User = require('../models/User')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

// @POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body

    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' })
    }

    // Hash password here in controller
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      profileImage: req.file ? req.file.path : ''
    })

    res.status(201).json({
      _id:          user._id,
      name:         user.name,
      email:        user.email,
      role:         user.role,
      profileImage: user.profileImage,
      token:        generateToken(user._id, user.role)
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    res.json({
      _id:          user._id,
      name:         user.name,
      email:        user.email,
      role:         user.role,
      profileImage: user.profileImage,
      token:        generateToken(user._id, user.role)
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @GET /api/auth/profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    user.name  = req.body.name  || user.name
    user.email = req.body.email || user.email
    if (req.file) user.profileImage = req.file.path

    // Handle password change if provided
    if (req.body.currentPassword && req.body.newPassword) {
      const isMatch = await bcrypt.compare(req.body.currentPassword, user.password)
      if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' })

      const salt = await bcrypt.genSalt(10)
      user.password = await bcrypt.hash(req.body.newPassword, salt)
    }

    await user.save()

    res.json({
      _id:          user._id,
      name:         user.name,
      email:        user.email,
      role:         user.role,
      profileImage: user.profileImage,
      token:        generateToken(user._id, user.role)
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @POST /api/auth/logout
const logoutUser = async (req, res) => {
  try {
    res.status(200).json({ message: 'Logged out successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}


module.exports = { registerUser, loginUser, logoutUser, getProfile, updateProfile }