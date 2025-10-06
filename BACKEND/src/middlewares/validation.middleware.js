

const { body } = require('express-validator')

// User Registration (nested fullname)
const validateUserRegistration = [
    body('fullname.firstname').trim().isLength({ min: 2, max: 30 }).withMessage('First name must be 2-30 chars'),
    body('fullname.lastname').trim().isLength({ min: 2, max: 30 }).withMessage('Last name must be 2-30 chars'),
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').isLength({ min: 8, max: 50 }).withMessage('Password 8-50 chars')
]

// User Login
const validateUserLogin = [
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required')
]

// Job create/update validation
const validateJob = [
    body('title').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Title 2-100 chars'),
    body('company').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Company 2-100 chars'),
    body('link').optional().isURL().withMessage('Valid URL needed'),
    body('description').optional().trim().isLength({ min: 10, max: 5000 }).withMessage('Description 10-5000 chars'),
    body('location').optional().trim().isLength({ max: 100 }),
    body('status').optional().isIn(['saved', 'applied', 'interviewing', 'offer', 'rejected']).withMessage('Invalid status')
]

// Resume from text
const validateResumeText = [
    body('title').trim().isLength({ min: 2, max: 100 }).withMessage('Title 2-100 chars'),
    body('content').trim().isLength({ min: 10, max: 10000 }).withMessage('Content 10-10000 chars')
]

// Resume file upload title only
const validateResumeFile = [
    body('title').trim().isLength({ min: 2, max: 100 }).withMessage('Title 2-100 chars')
]

// Resume AI analysis
const validateResumeAnalysis = [
    body('jobDescription').trim().isLength({ min: 10, max: 5000 }).withMessage('Job description 10-5000 chars')
]

// Notes creation
const validateNote = [
    body('jobId').isMongoId().withMessage('Valid job ID required'),
    body('title').trim().isLength({ min: 2, max: 100 }).withMessage('Title 2-100 chars'),
    body('content').trim().isLength({ min: 1, max: 5000 }).withMessage('Content 1-5000 chars')
]

// Notes update is partial
const validateNoteUpdate = [
    body('title').optional().trim().isLength({ min: 2, max: 100 }),
    body('content').optional().trim().isLength({ min: 1, max: 5000 })
]

// User status update
const validateUserStatusUpdate = [
    body('isActive').isBoolean().withMessage('isActive must be boolean')
]

module.exports = {
    validateUserRegistration,
    validateUserLogin,
    validateJob,
    validateResumeText,
    validateResumeFile,
    validateResumeAnalysis,
    validateNote,
    validateNoteUpdate,
    validateUserStatusUpdate
}

