

const multer = require('multer')

// Memory storage for efficiency & cross-platform compatibility
const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
        cb(null, true)
    } else {
        cb(new Error('Invalid file type. Only PDF and DOCX allowed.'), false)
    }
}

const uploadResume = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter
}).single('resumeFile')

module.exports = { uploadResume }
