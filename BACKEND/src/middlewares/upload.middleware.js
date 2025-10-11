const multer = require('multer')

const fileFilter = (req, file, cb) => {
const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    
    if (allowed.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(null, false)
        req.fileValidationError = 'Only PDF and DOCX files allowed'
    }
}

const uploadResume = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter
}).single('resumeFile')



const handleUploadError = (req, res, next) => {
    uploadResume(req, res, (err) => {
        if (req.fileValidationError) {
            return res.status(400).json({ success: false, message: req.fileValidationError })
        }
        
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ 
                success: false, 
                message: err.code === 'LIMIT_FILE_SIZE' 
                    ? 'File too large. Maximum 5MB' 
                    : `Upload error: ${err.message}` 
            })
        }
        
        if (err) return res.status(400).json({ success: false, message: err.message })
        
        next()
    })
}

const uploadProfilePicture = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/jpg', 'image/png']
        
        if (allowed.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb(null, false)
            req.fileValidationError = 'Only JPG, JPEG, and PNG images allowed'
        }
    }
}).single('profilePicture')


const handleProfilePictureUpload = (req, res, next) => {
    uploadProfilePicture(req, res, (err) => {
        if (req.fileValidationError) {
            return res.status(400).json({ success: false, message: req.fileValidationError })
        }
        
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ 
                success: false, 
                message: err.code === 'LIMIT_FILE_SIZE' 
                    ? 'File too large. Maximum 2MB' 
                    : `Upload error: ${err.message}` 
            })
        }
        
        if (err) return res.status(400).json({ success: false, message: err.message })
        
        next()
    })
}



module.exports = { uploadResume: handleUploadError ,
uploadProfilePicture: handleProfilePictureUpload }
