const express = require('express')
const {
    createResumeFromText,
    createResumeFromFile,
    getResumes,
    getResume,
    updateResume,
    deleteResume,
    analyzeResume,
    optimizeResume,
    downloadOptimizedResume
} = require('../controllers/resume.controller')
const { authUser } = require('../middlewares/auth.middleware')
const {
    validateResumeText,
    validateResumeFile,
    validateResumeAnalysis,
    validateResumeOptimization
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

// Two-step AI process
router.post('/:id/analyze', aiAnalysisRateLimit, validateResumeAnalysis, analyzeResume)
router.post('/:id/optimize', aiAnalysisRateLimit, validateResumeOptimization, optimizeResume)
router.get('/:id/download/:optimizationId', downloadOptimizedResume)


module.exports = router

