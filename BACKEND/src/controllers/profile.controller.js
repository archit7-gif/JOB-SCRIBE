
const userModel = require('../models/user.model')
const imageKitService = require('../services/imageKit.service')

const uploadProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" })
        }

        const userId = req.user._id

        // Delete old profile picture if exists
        const user = await userModel.findById(userId)
        if (user.profilePicture?.fileId) {
            try {
                await imageKitService.deleteProfilePicture(user.profilePicture.fileId)
            } catch (error) {
                console.error('Failed to delete old profile picture:', error)
                // Continue anyway - we'll upload the new one
            }
        }

        // Upload new profile picture
        const { url, fileId } = await imageKitService.uploadProfilePicture(
            req.file.buffer,
            userId.toString(),
            req.file.originalname
        )

        // Update user with new profile picture
        user.profilePicture = { url, fileId }
        await user.save()

        res.status(200).json({ 
            success: true, 
            message: "Profile picture uploaded successfully",
            data: {
                profilePicture: {
                    url,
                    fileId
                }
            }
        })
    } catch (error) {
        console.error('Upload profile picture error:', error)
        res.status(500).json({ success: false, message: "Failed to upload profile picture" })
    }
}

const deleteProfilePicture = async (req, res) => {
    try {
        const userId = req.user._id
        const user = await userModel.findById(userId)

        if (!user.profilePicture?.fileId) {
            return res.status(404).json({ success: false, message: "No profile picture to delete" })
        }

        // Delete from ImageKit
        try {
            await imageKitService.deleteProfilePicture(user.profilePicture.fileId)
        } catch (error) {
            console.error('ImageKit deletion failed:', error)
            // Continue to remove from DB even if ImageKit delete fails
        }

        // Remove from user
        user.profilePicture = { url: null, fileId: null }
        await user.save()

        res.status(200).json({ 
            success: true, 
            message: "Profile picture deleted successfully" 
        })
    } catch (error) {
        console.error('Delete profile picture error:', error)
        res.status(500).json({ success: false, message: "Failed to delete profile picture" })
    }
}

const getProfilePicture = async (req, res) => {
    try {
        const user = await userModel.findById(req.user._id).select('profilePicture fullname').lean()
        
        res.status(200).json({ 
            success: true, 
            data: {
                profilePicture: user.profilePicture?.url || null,
                initials: `${user.fullname.firstname[0]}${user.fullname.lastname[0]}`.toUpperCase()
            }
        })
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch profile picture" })
    }
}

module.exports = {
    uploadProfilePicture,
    deleteProfilePicture,
    getProfilePicture
}
