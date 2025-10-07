const resumeModel = require('../models/resume.model')
const { validationResult } = require('express-validator')
const fileParserService = require('../services/fileParser.service')
const aiService = require('../services/ai.service')
const pdfGenerator = require('../services/pdfGenerator.service')
const crypto = require('crypto')
const fs = require('fs')

const generateContentHash = (content) =>
    crypto.createHash('sha256').update(content.trim().toLowerCase()).digest('hex')

const createResumeFromText = async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                message: "Validation failed",
                errors: errors.array().map(err => ({
                    field: err.param,
                    message: err.msg
                }))
            })
        }

        const contentHash = generateContentHash(req.body.content)

        const existingResume = await resumeModel.findOne({
            user: req.user.id,
            contentHash: contentHash
        })
        if (existingResume) {
            return res.status(200).json({
                success: true,
                message: "Resume with identical content already exists",
                data: existingResume,
                isDuplicate: true
            })
        }

        const resume = await resumeModel.create({
            user: req.user.id,
            title: req.body.title,
            content: req.body.content,
            contentHash,
            type: 'text'
        })
        res.status(201).json({ success: true, message: "Resume created", data: resume })
    } catch (error) {
        console.error('Create resume error:', error)
        res.status(500).json({ success: false, message: "Could not create resume" })
    }
}

const createResumeFromFile = async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                message: "Validation failed",
                errors: errors.array().map(err => ({
                    field: err.param,
                    message: err.msg
                }))
            })
        }

        if (!req.file)
            return res.status(400).json({ success: false, message: "No file uploaded" })

        let extractedText = ""
        try {
            let fileBuffer = req.file.buffer 
                ? req.file.buffer 
                : req.file.path ? fs.readFileSync(req.file.path) : null

            if (!fileBuffer) throw new Error("Upload error: No file buffer available")

            if (req.file.mimetype === 'application/pdf') {
                extractedText = await fileParserService.extractPDFText(fileBuffer)
            } else if (
                req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ) {
                extractedText = await fileParserService.extractDOCXText(fileBuffer)
            } else {
                return res.status(400).json({
                    success: false,
                    message: "Only PDF and DOCX files allowed"
                })
            }
        } catch (parseError) {
            return res.status(400).json({
                success: false,
                message: "Could not extract text from file. Please ensure the file is not corrupted."
            })
        } finally {
            if (req.file.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path)
        }

        const contentHash = generateContentHash(extractedText)

        const existingResume = await resumeModel.findOne({
            user: req.user.id,
            contentHash: contentHash
        })
        if (existingResume) {
            return res.status(200).json({
                success: true,
                message: "Resume with identical extracted content already exists",
                data: existingResume,
                isDuplicate: true
            })
        }

        const resume = await resumeModel.create({
            user: req.user.id,
            title: req.body.title,
            content: extractedText,
            contentHash: contentHash,
            type: 'file',
            fileName: req.file.originalname,
            fileSize: req.file.size,
            mimeType: req.file.mimetype
        })

        res.status(201).json({ success: true, message: "Resume created from file", data: resume })
    } catch (error) {
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path)
        }
        console.error('Create resume from file error:', error)
        res.status(500).json({ success: false, message: "Error creating resume from file" })
    }
}

const getResumes = async (req, res) => {
    try {
        const resumes = await resumeModel.find({ user: req.user.id })
            .select("-content -aiAnalyses -optimizations")
            .sort({ updatedAt: -1 })
        res.status(200).json({ success: true, data: resumes })
    } catch (error) {
        res.status(500).json({ success: false, message: "Could not fetch resumes" })
    }
}

const getResume = async (req, res) => {
    try {
        const resume = await resumeModel.findOne({ _id: req.params.id, user: req.user.id })
        if (!resume)
            return res.status(404).json({ success: false, message: "Resume not found" })
        res.status(200).json({ success: true, data: resume })
    } catch (error) {
        res.status(500).json({ success: false, message: "Could not fetch resume" })
    }
}

// STEP 1: Analyze and get suggestions
const analyzeResume = async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                message: "Validation failed",
                errors: errors.array().map(err => ({
                    field: err.param,
                    message: err.msg
                }))
            })
        }

        const resume = await resumeModel.findOne({ _id: req.params.id, user: req.user.id })
        if (!resume)
            return res.status(404).json({ success: false, message: "Resume not found" })

        const jobDescHash = crypto.createHash('sha256')
            .update(req.body.jobDescription.trim().toLowerCase())
            .digest('hex')

        // Check cache
        const existingAnalysis = resume.aiAnalyses?.find(a => a.jobDescHash === jobDescHash)
        if (existingAnalysis) {
            return res.status(200).json({
                success: true,
                message: "Analysis retrieved from cache",
                data: {
                    resumeId: resume._id,
                    analysisId: existingAnalysis._id,
                    analysis: existingAnalysis,
                    fromCache: true
                }
            })
        }

        // Generate new analysis
        const analysis = await aiService.analyzeResumeForJob(resume.content, req.body.jobDescription)

        resume.aiAnalyses = resume.aiAnalyses || []
        const newAnalysis = {
            jobDescription: req.body.jobDescription.substring(0, 500),
            jobDescHash,
            jobTitle: req.body.jobTitle || "Job Analysis",
            matchScore: analysis.matchScore || 0,
            strengths: analysis.strengths || [],
            suggestions: analysis.suggestions || [],
            missingKeywords: analysis.missingKeywords || [],
            sectionsToImprove: analysis.sectionsToImprove || [],
            createdAt: new Date()
        }
        resume.aiAnalyses.unshift(newAnalysis)
        
        if (resume.aiAnalyses.length > 10) {
            resume.aiAnalyses = resume.aiAnalyses.slice(0, 10)
        }
        await resume.save()

        res.status(200).json({
            success: true,
            message: "Resume analyzed successfully",
            data: {
                resumeId: resume._id,
                analysisId: resume.aiAnalyses._id,
                analysis: newAnalysis,
                fromCache: false
            }
        })
    } catch (error) {
        console.error('Analyze resume error:', error)
        res.status(500).json({ success: false, message: "AI analysis failed" })
    }
}

// STEP 2: Generate optimized resume (requires analysis first)
const optimizeResume = async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                message: "Validation failed",
                errors: errors.array().map(err => ({
                    field: err.param,
                    message: err.msg
                }))
            })
        }

        const resume = await resumeModel.findOne({ _id: req.params.id, user: req.user.id })
        if (!resume)
            return res.status(404).json({ success: false, message: "Resume not found" })

        // analysisId must be provided
        if (!req.body.analysisId) {
            return res.status(400).json({ 
                success: false, 
                message: "analysisId required. Please analyze resume first." 
            })
        }

        const analysis = resume.aiAnalyses?.find(a => a._id.toString() === req.body.analysisId)
        if (!analysis) {
            return res.status(404).json({ 
                success: false, 
                message: "Analysis not found. Please analyze resume first." 
            })
        }

        const jobDescHash = analysis.jobDescHash

        // Check if already optimized
        const existingOptimization = resume.optimizations?.find(o => o.jobDescHash === jobDescHash)
        if (existingOptimization) {
            return res.status(200).json({
                success: true,
                message: "Optimization retrieved from cache",
                data: {
                    resumeId: resume._id,
                    optimizationId: existingOptimization._id,
                    optimization: existingOptimization,
                    fromCache: true
                }
            })
        }

        // Generate optimization
        const result = await aiService.generateResumeOptimization(
            resume.content,
            analysis.jobDescription,
            analysis.suggestions
        )

        if (!result.success) {
            return res.status(500).json({ 
                success: false, 
                message: "Optimization failed. Please try again." 
            })
        }

        // Store optimization
        resume.optimizations = resume.optimizations || []
        const newOptimization = {
            analysisId: analysis._id,
            jobDescription: analysis.jobDescription,
            jobDescHash: jobDescHash,
            jobTitle: analysis.jobTitle,
            originalContent: resume.content,
            optimizedContent: result.optimizedContent,
            appliedSuggestions: analysis.suggestions,
            createdAt: new Date()
        }
        
        resume.optimizations.unshift(newOptimization)
        if (resume.optimizations.length > 10) {
            resume.optimizations = resume.optimizations.slice(0, 10)
        }
        await resume.save()

        res.status(200).json({
            success: true,
            message: "Resume optimized successfully",
            data: {
                resumeId: resume._id,
                optimizationId: resume.optimizations._id,
                optimization: {
                    jobTitle: newOptimization.jobTitle,
                    optimizedContent: newOptimization.optimizedContent,
                    appliedSuggestions: newOptimization.appliedSuggestions,
                    createdAt: newOptimization.createdAt
                },
                fromCache: false
            }
        })
    } catch (error) {
        console.error('Optimize resume error:', error)
        res.status(500).json({ success: false, message: "Resume optimization failed" })
    }
}

// Download optimized resume
const downloadOptimizedResume = async (req, res) => {
    try {
        const resume = await resumeModel.findOne({ 
            _id: req.params.id, 
            user: req.user.id 
        })
        
        if (!resume)
            return res.status(404).json({ success: false, message: "Resume not found" })

        const optimization = resume.optimizations?.find(
            o => o._id.toString() === req.params.optimizationId
        )

        if (!optimization)
            return res.status(404).json({ success: false, message: "Optimization not found" })

        // Generate PDF
        const pdfBuffer = await pdfGenerator.generateResumePDFBuffer(
            optimization.optimizedContent
        )

        const filename = `${resume.title.replace(/[^a-z0-9]/gi, '_')}_optimized.pdf`
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
        res.setHeader('Content-Length', pdfBuffer.length)

        res.send(pdfBuffer)
        
    } catch (error) {
        console.error('Download optimized resume error:', error)
        res.status(500).json({ success: false, message: "Failed to generate download" })
    }
}

const updateResume = async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                message: "Validation failed",
                errors: errors.array().map(err => ({
                    field: err.param,
                    message: err.msg
                }))
            })
        }

        const resume = await resumeModel.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            {
                title: req.body.title,
                content: req.body.content,
                contentHash: generateContentHash(req.body.content),
                // Clear analyses and optimizations on content update
                aiAnalyses: [],
                optimizations: []
            },
            { new: true }
        )
        if (!resume)
            return res.status(404).json({ success: false, message: "Resume not found" })
        
        res.status(200).json({ 
            success: true, 
            message: "Resume updated. Previous analyses cleared.", 
            data: resume 
        })
    } catch (error) {
        console.error('Update resume error:', error)
        res.status(500).json({ success: false, message: "Could not update resume" })
    }
}

const deleteResume = async (req, res) => {
    try {
        const resume = await resumeModel.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id
        })
        if (!resume)
            return res.status(404).json({ success: false, message: "Resume not found" })
        
        res.status(200).json({ 
            success: true, 
            message: "Resume and all associated analyses/optimizations deleted" 
        })
    } catch (error) {
        console.error('Delete resume error:', error)
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

