const express = require('express')
const router = express.Router()
const { registerUser, loginUser, getProfile, updateProfile, logoutUser } = require('../controllers/authController')
const { protect } = require('../middleware/authMiddleware')
const upload = require('../middleware/uploadMiddleware')

router.post('/register', upload.single('profileImage'), registerUser)
router.post('/login', loginUser)
router.post('/logout', protect, logoutUser) 
router.get('/profile', protect, getProfile)
router.put('/profile', protect, upload.single('profileImage'), updateProfile)

module.exports = router
