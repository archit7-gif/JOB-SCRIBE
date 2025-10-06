
const express = require('express')
const {
    createResumeFromText,
    createResumeFromFile,
    getResumes,
    getResume,
    updateResume,
    deleteResume,
    analyzeResume
} = require('../controllers/resume.controller')
const { authUser } = require('../middlewares/auth.middleware')
const {
    validateResumeText,
    validateResumeFile,
    validateResumeAnalysis
} = require('../middlewares/validation.middleware')
const { uploadResume } = require('../middlewares/upload.middleware')
const { aiAnalysisRateLimit, uploadRateLimit } = require('../middlewares/rateLimit.middleware')

const router = express.Router()

router.use(authUser)

router.post('/text', validateResumeText, createResumeFromText)
router.post('/upload', uploadRateLimit, uploadResume, validateResumeFile, createResumeFromFile)
router.get('/', getResumes)
router.get('/:id', getResume)
router.put('/:id', validateResumeText, updateResume)
router.delete('/:id', deleteResume)
router.post('/:id/analyze', aiAnalysisRateLimit, validateResumeAnalysis, analyzeResume)

module.exports = router
