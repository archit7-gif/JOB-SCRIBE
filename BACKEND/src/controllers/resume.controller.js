
const resumeModel = require('../models/resume.model')
const { validationResult } = require('express-validator')
const fileParserService = require('../services/fileParser.service')
const aiService = require('../services/ai.service')
const crypto = require('crypto')
const fs = require('fs')

const hashContent = (content) => crypto.createHash('sha256').update(content.trim().toLowerCase()).digest('hex')

const handleValidationErrors = (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        res.status(400).json({ 
            success: false, 
            message: "Validation failed",
            errors: errors.array().map(({ param, msg }) => ({ field: param, message: msg }))
        })
        return true
    }
    return false
}

// Create resume from text
const createResumeFromText = async (req, res) => {
    try {
        if (handleValidationErrors(req, res)) return

        const { title, content } = req.body
        const contentHash = hashContent(content)
        const userId = req.user._id

        const existing = await resumeModel.findOne({ user: userId, contentHash }).lean()
        if (existing) {
            return res.status(200).json({
                success: true,
                message: "Resume with identical content already exists",
                data: existing,
                isDuplicate: true
            })
        }

        const resume = await resumeModel.create({ user: userId, title, content, contentHash, type: 'text' })
        res.status(201).json({ success: true, message: "Resume created", data: resume })
    } catch (error) {
        res.status(500).json({ success: false, message: "Could not create resume" })
    }
}

// Create resume from uploaded file (PDF/DOCX)
const createResumeFromFile = async (req, res) => {
    try {
        if (handleValidationErrors(req, res)) return
        if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" })

        const { title } = req.body
        const { buffer, path: filePath, mimetype, originalname, size } = req.file
        let extractedText = ""

        try {
            const fileBuffer = buffer || (filePath && fs.readFileSync(filePath))
            if (!fileBuffer) throw new Error("No file buffer")

            extractedText = mimetype === 'application/pdf'
                ? await fileParserService.extractPDFText(fileBuffer)
                : await fileParserService.extractDOCXText(fileBuffer)
        } catch (parseError) {
            return res.status(400).json({ success: false, message: "Could not extract text from file" })
        } finally {
            if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath)
        }

        const contentHash = hashContent(extractedText)
        const userId = req.user._id

        const existing = await resumeModel.findOne({ user: userId, contentHash }).lean()
        if (existing) {
            return res.status(200).json({
                success: true,
                message: "Resume with identical content already exists",
                data: existing,
                isDuplicate: true
            })
        }

        const resume = await resumeModel.create({
            user: userId, title, content: extractedText, contentHash, type: 'file',
            fileName: originalname, fileSize: size, mimeType: mimetype
        })

        res.status(201).json({ success: true, message: "Resume created from file", data: resume })
    } catch (error) {
        if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path)
        res.status(500).json({ success: false, message: "Error creating resume from file" })
    }
}

// Get all resumes for logged-in user
const getResumes = async (req, res) => {
    try {
        const resumes = await resumeModel
            .find({ user: req.user._id })
            .select("title type fileName fileSize mimeType createdAt updatedAt")
            .sort({ updatedAt: -1 })
            .lean()
        
        res.status(200).json({ success: true, data: resumes })
    } catch (error) {
        res.status(500).json({ success: false, message: "Could not fetch resumes" })
    }
}

// Get single resume
const getResume = async (req, res) => {
    try {
        const resume = await resumeModel.findOne({ _id: req.params.id, user: req.user._id }).lean()
        if (!resume) return res.status(404).json({ success: false, message: "Resume not found" })
        res.status(200).json({ success: true, data: resume })
    } catch (error) {
        res.status(500).json({ success: false, message: "Could not fetch resume" })
    }
}

// Analyze resume against job description
const analyzeResume = async (req, res) => {
    try {
        if (handleValidationErrors(req, res)) return

        const { jobDescription, jobTitle = "Job Analysis" } = req.body
        const resume = await resumeModel.findOne({ _id: req.params.id, user: req.user._id })
        if (!resume) return res.status(404).json({ success: false, message: "Resume not found" })

        const jobDescHash = hashContent(jobDescription)
        const existingAnalysis = resume.aiAnalyses?.find(a => a.jobDescHash === jobDescHash)
        
        // Return cached analysis if exists
        if (existingAnalysis) {
            return res.status(200).json({
                success: true,
                message: "Analysis retrieved from cache",
                data: { resumeId: resume._id, analysisId: existingAnalysis._id, analysis: existingAnalysis, fromCache: true }
            })
        }

        // AI analysis
        const analysis = await aiService.analyzeResumeForJob(resume.content, jobDescription)

        const newAnalysis = {
            jobDescription: jobDescription.substring(0, 500),
            jobDescHash, jobTitle,
            matchScore: analysis.matchScore || 0,
            strengths: analysis.strengths || [],
            suggestions: analysis.suggestions || [],
            missingKeywords: analysis.missingKeywords || [],
            sectionsToImprove: analysis.sectionsToImprove || [],
            createdAt: new Date()
        }
        
        resume.aiAnalyses = resume.aiAnalyses || []
        resume.aiAnalyses.unshift(newAnalysis)
        if (resume.aiAnalyses.length > 10) resume.aiAnalyses = resume.aiAnalyses.slice(0, 10)
        await resume.save()

        res.status(200).json({
            success: true,
            message: "Resume analyzed successfully",
            data: { resumeId: resume._id, analysisId: resume.aiAnalyses[0]._id, analysis: newAnalysis, fromCache: false }
        })
    } catch (error) {
        res.status(500).json({ success: false, message: "AI analysis failed" })
    }
}

// Optimize resume for job description
const optimizeResume = async (req, res) => {
    try {
        if (handleValidationErrors(req, res)) return

        const { analysisId } = req.body
        if (!analysisId) return res.status(400).json({ success: false, message: "analysisId required" })

        const resume = await resumeModel.findOne({ _id: req.params.id, user: req.user._id })
        if (!resume) return res.status(404).json({ success: false, message: "Resume not found" })

        const analysis = resume.aiAnalyses?.find(a => a._id.toString() === analysisId)
        if (!analysis) return res.status(404).json({ success: false, message: "Analysis not found" })

        // Return cached optimization if exists
        const existingOpt = resume.optimizations?.find(o => o.jobDescHash === analysis.jobDescHash)
        if (existingOpt) {
            return res.status(200).json({
                success: true,
                message: "Optimization retrieved from cache",
                data: { 
                    resumeId: resume._id, 
                    optimizationId: existingOpt._id, 
                    optimization: {
                        jobTitle: existingOpt.jobTitle,
                        optimizedContent: existingOpt.optimizedContent,
                        appliedSuggestions: existingOpt.appliedSuggestions,
                        createdAt: existingOpt.createdAt
                    }, 
                    fromCache: true 
                }
            })
        }

        // AI optimize resume content
        const result = await aiService.generateResumeOptimization(resume.content, analysis.jobDescription, analysis.suggestions)
        if (!result.success) return res.status(500).json({ success: false, message: "Optimization failed" })

        // Save optimization
        resume.optimizations = resume.optimizations || []
        resume.optimizations.unshift({
            analysisId: analysis._id,
            jobDescription: analysis.jobDescription,
            jobDescHash: analysis.jobDescHash,
            jobTitle: analysis.jobTitle,
            originalContent: resume.content,
            optimizedContent: result.optimizedContent,
            appliedSuggestions: analysis.suggestions,
            createdAt: new Date()
        })
        
        if (resume.optimizations.length > 10) resume.optimizations = resume.optimizations.slice(0, 10)
        await resume.save()

        res.status(200).json({
            success: true,
            message: "Resume optimized successfully",
            data: {
                resumeId: resume._id,
                optimizationId: resume.optimizations[0]._id,
                optimization: {
                    jobTitle: resume.optimizations[0].jobTitle,
                    optimizedContent: resume.optimizations[0].optimizedContent,
                    appliedSuggestions: resume.optimizations[0].appliedSuggestions,
                    createdAt: resume.optimizations[0].createdAt
                },
                fromCache: false
            }
        })
    } catch (error) {
        console.error('Optimization error:', error)
        res.status(500).json({ success: false, message: "Resume optimization failed" })
    }
}

// Download optimized resume as .txt file
const downloadOptimizedResume = async (req, res) => {
    try {
        const resume = await resumeModel.findOne({ _id: req.params.id, user: req.user._id }).lean()
        if (!resume) return res.status(404).json({ success: false, message: "Resume not found" })

        const optimizationId = req.params.optimizationId
        let opt = resume.optimizations?.find(o => o._id.toString() === optimizationId)
        
        if (!opt && resume.optimizations?.length > 0) {
            opt = resume.optimizations[0]
        }
        
        if (!opt) return res.status(404).json({ success: false, message: "No optimization found" })

        // Send as plain text file
        const filename = `${resume.title.replace(/[^a-z0-9]/gi, '_')}_optimized.txt`
        
        res.set({
            'Content-Type': 'text/plain; charset=utf-8',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': Buffer.byteLength(opt.optimizedContent, 'utf8')
        }).send(opt.optimizedContent)
        
    } catch (error) {
        console.error('Download error:', error)
        res.status(500).json({ success: false, message: "Failed to download resume" })
    }
}

// Update resume
const updateResume = async (req, res) => {
    try {
        if (handleValidationErrors(req, res)) return

        const { title, content } = req.body
        const resume = await resumeModel.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { title, content, contentHash: hashContent(content), aiAnalyses: [], optimizations: [] },
            { new: true }
        )
        
        if (!resume) return res.status(404).json({ success: false, message: "Resume not found" })
        res.status(200).json({ success: true, message: "Resume updated", data: resume })
    } catch (error) {
        res.status(500).json({ success: false, message: "Could not update resume" })
    }
}

// Delete resume
const deleteResume = async (req, res) => {
    try {
        const resume = await resumeModel.findOneAndDelete({ _id: req.params.id, user: req.user._id })
        if (!resume) return res.status(404).json({ success: false, message: "Resume not found" })
        res.status(200).json({ success: true, message: "Resume deleted" })
    } catch (error) {
        res.status(500).json({ success: false, message: "Could not delete resume" })
    }
}

module.exports = {
    createResumeFromText,
    createResumeFromFile,
    getResumes,
    getResume,
    analyzeResume,
    optimizeResume,
    downloadOptimizedResume,
    updateResume,
    deleteResume
}
