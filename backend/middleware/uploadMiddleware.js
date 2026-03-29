const multer = require('multer')
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const cloudinary = require('cloudinary').v2

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: 'sitesync',
      allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'heic', 'heif'],
      resource_type: 'auto'
    }
  }
})

const upload = multer({ storage })

module.exports = upload