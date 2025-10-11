
const express = require('express')
const {
    uploadProfilePicture,
    deleteProfilePicture,
    getProfilePicture
} = require('../controllers/profile.controller')
const { authUser } = require('../middlewares/auth.middleware')
const { uploadProfilePicture: uploadMiddleware } = require('../middlewares/upload.middleware')

const router = express.Router()

// All routes require authentication
router.use(authUser)

// Get profile picture
router.get('/picture', getProfilePicture)

// Upload profile picture
router.post('/picture', uploadMiddleware, uploadProfilePicture)

// Delete profile picture
router.delete('/picture', deleteProfilePicture)

module.exports = router
