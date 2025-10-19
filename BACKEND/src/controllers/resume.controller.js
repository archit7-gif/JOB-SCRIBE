const resumeModel = require('../models/resume.model')
const { validationResult } = require('express-validator')
const fileParserService = require('../services/fileParser.service')
const aiService = require('../services/ai.service')
const pdfGenerator = require('../services/pdfGenerator.service')
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
        return true  // Return true = validation failed
    }
    return false  // Return false = validation passed
}

const createResumeFromText = async (req, res) => {
    try {
        if (handleValidationErrors(req, res)) return

        const { title, content } = req.body
        const contentHash = hashContent(content)
        const userId = req.user._id  // FIXED: changed from req.user.id

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
        const userId = req.user._id  // FIXED: changed from req.user.id

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

const getResumes = async (req, res) => {
    try {
        const resumes = await resumeModel
            .find({ user: req.user._id })  // FIXED: changed from req.user.id
            .select("title type fileName fileSize mimeType createdAt updatedAt")
            .sort({ updatedAt: -1 })
            .lean()
        
        res.status(200).json({ success: true, data: resumes })
    } catch (error) {
        res.status(500).json({ success: false, message: "Could not fetch resumes" })
    }
}

const getResume = async (req, res) => {
    try {
        const resume = await resumeModel.findOne({ _id: req.params.id, user: req.user._id }).lean()  // FIXED
        if (!resume) return res.status(404).json({ success: false, message: "Resume not found" })
        res.status(200).json({ success: true, data: resume })
    } catch (error) {
        res.status(500).json({ success: false, message: "Could not fetch resume" })
    }
}

const analyzeResume = async (req, res) => {
    try {
        if (handleValidationErrors(req, res)) return

        const { jobDescription, jobTitle = "Job Analysis" } = req.body
        const resume = await resumeModel.findOne({ _id: req.params.id, user: req.user._id })  // FIXED
        if (!resume) return res.status(404).json({ success: false, message: "Resume not found" })

        const jobDescHash = hashContent(jobDescription)
        const existingAnalysis = resume.aiAnalyses?.find(a => a.jobDescHash === jobDescHash)
        
        if (existingAnalysis) {
            return res.status(200).json({
                success: true,
                message: "Analysis retrieved from cache",
                data: { resumeId: resume._id, analysisId: existingAnalysis._id, analysis: existingAnalysis, fromCache: true }
            })
        }

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

const optimizeResume = async (req, res) => {
    try {
        if (handleValidationErrors(req, res)) return

        const { analysisId } = req.body
        if (!analysisId) return res.status(400).json({ success: false, message: "analysisId required" })

        const resume = await resumeModel.findOne({ _id: req.params.id, user: req.user._id })  // FIXED
        if (!resume) return res.status(404).json({ success: false, message: "Resume not found" })

        const analysis = resume.aiAnalyses?.find(a => a._id.toString() === analysisId)
        if (!analysis) return res.status(404).json({ success: false, message: "Analysis not found" })

        const { jobDescHash } = analysis
        const existingOpt = resume.optimizations?.find(o => o.jobDescHash === jobDescHash)
        
        if (existingOpt) {
            return res.status(200).json({
                success: true,
                message: "Optimization retrieved from cache",
                data: { resumeId: resume._id, optimizationId: existingOpt._id, optimization: existingOpt, fromCache: true }
            })
        }

        const result = await aiService.generateResumeOptimization(resume.content, analysis.jobDescription, analysis.suggestions)
        if (!result.success) return res.status(500).json({ success: false, message: "Optimization failed" })

        const newOpt = {
            analysisId: analysis._id,
            jobDescription: analysis.jobDescription,
            jobDescHash,
            jobTitle: analysis.jobTitle,
            originalContent: resume.content,
            optimizedContent: result.optimizedContent,
            appliedSuggestions: analysis.suggestions,
            createdAt: new Date()
        }
        
        resume.optimizations = resume.optimizations || []
        resume.optimizations.unshift(newOpt)
        if (resume.optimizations.length > 10) resume.optimizations = resume.optimizations.slice(0, 10)
        await resume.save()

        res.status(200).json({
            success: true,
            message: "Resume optimized successfully",
            data: {
                resumeId: resume._id,
                optimizationId: resume.optimizations[0]._id,
                optimization: {
                    jobTitle: newOpt.jobTitle,
                    optimizedContent: newOpt.optimizedContent,
                    appliedSuggestions: newOpt.appliedSuggestions,
                    createdAt: newOpt.createdAt
                },
                fromCache: false
            }
        })
    } catch (error) {
        res.status(500).json({ success: false, message: "Resume optimization failed" })
    }
}

const downloadOptimizedResume = async (req, res) => {
    try {
        const resume = await resumeModel.findOne({ 
            _id: req.params.id, 
            user: req.user._id 
        }).lean()
        
        if (!resume) {
            return res.status(404).json({ 
                success: false, 
                message: "Resume not found" 
            })
        }

        const opt = resume.optimizations?.find(
            o => o._id.toString() === req.params.optimizationId
        )
        
        if (!opt) {
            return res.status(404).json({ 
                success: false, 
                message: "Optimization not found" 
            })
        }

        // Generate professional PDF (no title, formatted content)
        const pdfBuffer = await pdfGenerator.generateResumePDFBuffer(
            opt.optimizedContent,
            resume.title // Pass resume title for metadata only, not displayed
        )
        
        const filename = `${resume.title.replace(/[^a-z0-9]/gi, '_')}_optimized.pdf`
        
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': pdfBuffer.length
        }).send(pdfBuffer)
        
    } catch (error) {
        console.error('Download optimized resume error:', error)
        res.status(500).json({ 
            success: false, 
            message: "Failed to generate download" 
        })
    }
}


const updateResume = async (req, res) => {
    try {
        if (handleValidationErrors(req, res)) return

        const { title, content } = req.body
        const resume = await resumeModel.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },  // FIXED
            { title, content, contentHash: hashContent(content), aiAnalyses: [], optimizations: [] },
            { new: true }
        )
        
        if (!resume) return res.status(404).json({ success: false, message: "Resume not found" })
        res.status(200).json({ success: true, message: "Resume updated", data: resume })
    } catch (error) {
        res.status(500).json({ success: false, message: "Could not update resume" })
    }
}

const deleteResume = async (req, res) => {
    try {
        const resume = await resumeModel.findOneAndDelete({ _id: req.params.id, user: req.user._id })  // FIXED
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
