

const ImageKit = require('imagekit')

class ImageKitService {
    constructor() {
        if (!process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY || !process.env.IMAGEKIT_URL_ENDPOINT) {
            console.warn('⚠️ ImageKit credentials not found. Profile picture uploads will not work.')
            this.imagekit = null
            return
        }

        this.imagekit = new ImageKit({
            publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
            privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
            urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
        })
    }

    async uploadProfilePicture(fileBuffer, userId, fileName) {
        if (!this.imagekit) {
            throw new Error('ImageKit not configured')
        }

        try {
            const result = await this.imagekit.upload({
                file: fileBuffer,
                fileName: `profile_${userId}_${Date.now()}.jpg`,
                folder: '/profile-pictures',
                useUniqueFileName: true,
                tags: ['profile', userId]
            })

            return {
                url: result.url,
                fileId: result.fileId
            }
        } catch (error) {
            console.error('ImageKit upload error:', error)
            throw new Error('Failed to upload profile picture')
        }
    }

    async deleteProfilePicture(fileId) {
        if (!this.imagekit) {
            throw new Error('ImageKit not configured')
        }

        try {
            await this.imagekit.deleteFile(fileId)
        } catch (error) {
            console.error('ImageKit delete error:', error)
            throw new Error('Failed to delete profile picture')
        }
    }
}

module.exports = new ImageKitService()
