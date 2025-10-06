

const resumeModel = require('../models/resume.model')
const { validationResult } = require('express-validator')
const fileParserService = require('../services/fileParser.service')
const aiService = require('../services/ai.service')
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
                    message: err.msg,
                    value: err.value
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
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, message: "Validation failed" })

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
        res.status(500).json({ success: false, message: "Error creating resume from file" })
    }
}

const getResumes = async (req, res) => {
    try {
        const resumes = await resumeModel.find({ user: req.user.id }).select("-content")
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

// AI analysis with per-jobdesc hash caching
const analyzeResume = async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                message: "Validation failed",
                errors: errors.array().map(err => ({
                    field: err.param,
                    message: err.msg,
                    value: err.value
                }))
            })
        }

        const resume = await resumeModel.findOne({ _id: req.params.id, user: req.user.id })
        if (!resume)
            return res.status(404).json({ success: false, message: "Resume not found" })

        const jobDescHash = crypto.createHash('sha256')
            .update(req.body.jobDescription.trim().toLowerCase())
            .digest('hex')

        const existingAnalysis = resume.aiAnalyses?.find(a => a.jobDescHash === jobDescHash)
        if (existingAnalysis) {
            return res.status(200).json({
                success: true,
                message: "Analysis retrieved from cache",
                data: {
                    resumeId: resume._id,
                    analysis: existingAnalysis,
                    fromCache: true
                }
            })
        }

        const analysis = await aiService.analyzeResumeForJob(resume.content, req.body.jobDescription)

        resume.aiAnalyses = resume.aiAnalyses || []
        const newAnalysis = {
            jobDescription: req.body.jobDescription.substring(0, 500),
            jobDescHash,
            jobTitle: req.body.jobTitle || "Job Analysis",
            matchScore: analysis.matchScore || 0,
            suggestions: analysis.suggestions || [],
            missingKeywords: analysis.missingKeywords || [],
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
                analysis: newAnalysis,
                fromCache: false
            }
        })
    } catch (error) {
        console.error('Analyze resume error:', error)
        res.status(500).json({ success: false, message: "AI analysis failed" })
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
                    message: err.msg,
                    value: err.value
                }))
            })
        }

        const resume = await resumeModel.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            {
                title: req.body.title,
                content: req.body.content,
                contentHash: generateContentHash(req.body.content)
            },
            { new: true }
        )
        if (!resume)
            return res.status(404).json({ success: false, message: "Resume not found" })
        res.status(200).json({ success: true, message: "Resume updated", data: resume })
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
    updateResume,
    deleteResume
}
