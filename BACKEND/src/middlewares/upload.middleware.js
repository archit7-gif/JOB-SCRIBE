

const multer = require('multer')

const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
        cb(null, true)
    } else {
        cb(null, false) // Don't throw error, just reject file
        req.fileValidationError = 'Only PDF and DOCX files allowed'
    }
}

const uploadResume = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter
}).single('resumeFile')

// Wrap to handle errors properly
const handleUploadError = (req, res, next) => {
    uploadResume(req, res, (err) => {
        // Check for file validation error
        if (req.fileValidationError) {
            return res.status(400).json({ 
                success: false, 
                message: req.fileValidationError 
            })
        }
        
        // Check for multer errors
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ 
                    success: false, 
                    message: 'File too large. Maximum size is 5MB' 
                })
            }
            return res.status(400).json({ 
                success: false, 
                message: `Upload error: ${err.message}` 
            })
        }
        
        // Check for other errors
        if (err) {
            return res.status(400).json({ 
                success: false, 
                message: err.message || 'File upload failed' 
            })
        }
        
        next()
    })
}



module.exports = { uploadResume: handleUploadError }
