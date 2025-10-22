

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

        const resume = await resumeModel.findOne({ _id: req.params.id, user: req.user._id })
        if (!resume) return res.status(404).json({ success: false, message: "Resume not found" })

        const analysis = resume.aiAnalyses?.find(a => a._id.toString() === analysisId)
        if (!analysis) return res.status(404).json({ success: false, message: "Analysis not found" })

        const { jobDescHash } = analysis
        const existingOpt = resume.optimizations?.find(o => o.jobDescHash === jobDescHash)
        
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

        console.log('🔄 Starting optimization process...')

        // STEP 1: Extract links from original resume (if not done)
        if (!resume.extractedLinks || !resume.extractedLinks.personalInfo) {
            console.log('📎 Extracting links from original resume...')
            const originalData = await aiService.extractStructuredJSON(resume.content)
            
            resume.extractedLinks = {
                personalInfo: {
                    linkedin: originalData.personalInfo?.linkedin || null,
                    github: originalData.personalInfo?.github || null,
                    twitter: originalData.personalInfo?.twitter || null,
                    portfolio: originalData.personalInfo?.portfolio || null,
                    email: originalData.personalInfo?.email || null
                },
                projects: (originalData.projects || []).map(p => ({
                    name: p.name,
                    link: p.link || null,
                    github: p.github || null,
                    liveDemo: p.liveDemo || null,
                    demo: p.demo || null,
                    url: p.url || null
                }))
            }
            
            await resume.save()
            console.log('✅ Links extracted:', resume.extractedLinks.projects.length, 'projects')
        }

        // STEP 2: AI optimizes resume content
        console.log('🤖 AI optimizing resume...')
        const result = await aiService.generateResumeOptimization(resume.content, analysis.jobDescription, analysis.suggestions)
        if (!result.success) {
            return res.status(500).json({ success: false, message: "Optimization failed" })
        }

        // STEP 3: Extract structure from optimized content IMMEDIATELY
        console.log('📊 Extracting structure from optimized content...')
        const optimizedStructure = await aiService.extractStructuredJSON(result.optimizedContent)
        
        // STEP 4: Inject original links into optimized structure
        console.log('🔗 Injecting original links...')
        const finalStructure = {
            ...optimizedStructure,
            personalInfo: {
                ...optimizedStructure.personalInfo,
                linkedin: resume.extractedLinks.personalInfo.linkedin || optimizedStructure.personalInfo.linkedin,
                github: resume.extractedLinks.personalInfo.github || optimizedStructure.personalInfo.github,
                twitter: resume.extractedLinks.personalInfo.twitter || optimizedStructure.personalInfo.twitter,
                portfolio: resume.extractedLinks.personalInfo.portfolio || optimizedStructure.personalInfo.portfolio,
                email: resume.extractedLinks.personalInfo.email || optimizedStructure.personalInfo.email
            },
            projects: optimizedStructure.projects.map((project, index) => {
                const originalProject = resume.extractedLinks.projects.find(p => 
                    p.name.toLowerCase().includes(project.name.toLowerCase()) ||
                    project.name.toLowerCase().includes(p.name.toLowerCase())
                )
                
                return {
                    ...project,
                    link: originalProject?.link || project.link,
                    github: originalProject?.github || project.github,
                    liveDemo: originalProject?.liveDemo || project.liveDemo,
                    demo: originalProject?.demo || project.demo,
                    url: originalProject?.url || project.url
                }
            })
        }

        console.log('✅ Final structure prepared with', finalStructure.projects.length, 'projects')

        // STEP 5: Store everything
        const newOpt = {
            analysisId: analysis._id,
            jobDescription: analysis.jobDescription,
            jobDescHash,
            jobTitle: analysis.jobTitle,
            originalContent: resume.content,
            optimizedContent: result.optimizedContent,
            appliedSuggestions: analysis.suggestions,
            structuredData: finalStructure,  // STORE STRUCTURED VERSION
            createdAt: new Date()
        }
        
        resume.optimizations = resume.optimizations || []
        resume.optimizations.unshift(newOpt)
        if (resume.optimizations.length > 10) resume.optimizations = resume.optimizations.slice(0, 10)
        await resume.save()

        console.log('💾 Optimization saved with structured data')

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
        console.error('❌ Optimization error:', error)
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
            return res.status(404).json({ success: false, message: "Resume not found" })
        }

        // Handle undefined or missing optimizationId
        let opt;
        const optimizationId = req.params.optimizationId
        
        if (optimizationId && optimizationId !== 'undefined' && optimizationId !== 'null') {
            console.log('📋 Using specific optimization:', optimizationId)
            opt = resume.optimizations?.find(o => o._id.toString() === optimizationId)
        } 
        
        // Fallback to latest optimization
        if (!opt && resume.optimizations && resume.optimizations.length > 0) {
            console.log('⚠️ OptimizationId missing/invalid, using latest optimization')
            opt = resume.optimizations[0]  // Most recent
        }
        
        if (!opt) {
            return res.status(404).json({ 
                success: false, 
                message: "No optimizations found. Please optimize resume first." 
            })
        }

        console.log('📄 Generating PDF from optimization:', opt._id)
        console.log('📊 Has structuredData:', !!opt.structuredData)
        
        let structuredData = opt.structuredData
        
        // Fallback for old optimizations without structuredData
        if (!structuredData) {
            console.log('⚠️ Old optimization without structuredData, extracting...')
            structuredData = await aiService.extractStructuredJSON(opt.optimizedContent)
            
            // Inject links if available
            if (resume.extractedLinks) {
                structuredData.personalInfo = {
                    ...structuredData.personalInfo,
                    linkedin: resume.extractedLinks.personalInfo?.linkedin || structuredData.personalInfo.linkedin,
                    github: resume.extractedLinks.personalInfo?.github || structuredData.personalInfo.github,
                    twitter: resume.extractedLinks.personalInfo?.twitter || structuredData.personalInfo.twitter,
                    portfolio: resume.extractedLinks.personalInfo?.portfolio || structuredData.personalInfo.portfolio,
                    email: resume.extractedLinks.personalInfo?.email || structuredData.personalInfo.email
                }
                
                // Inject project links
                if (resume.extractedLinks.projects && resume.extractedLinks.projects.length > 0) {
                    structuredData.projects = (structuredData.projects || []).map(project => {
                        const originalProject = resume.extractedLinks.projects.find(p => 
                            p.name.toLowerCase().replace(/[^a-z0-9]/g, '').includes(project.name.toLowerCase().replace(/[^a-z0-9]/g, '')) ||
                            project.name.toLowerCase().replace(/[^a-z0-9]/g, '').includes(p.name.toLowerCase().replace(/[^a-z0-9]/g, ''))
                        )
                        
                        if (originalProject) {
                            return {
                                ...project,
                                link: originalProject.link || project.link,
                                github: originalProject.github || project.github,
                                liveDemo: originalProject.liveDemo || project.liveDemo,
                                demo: originalProject.demo || project.demo,
                                url: originalProject.url || project.url
                            }
                        }
                        
                        return project
                    })
                }
            }
        }
        
console.log('✅ Final data for PDF:', {
    name: structuredData.personalInfo?.name,
    email: structuredData.personalInfo?.email,
    linkedin: structuredData.personalInfo?.linkedin,  // ADD THIS
    github: structuredData.personalInfo?.github,      // ADD THIS
    projects: structuredData.projects?.length || 0,
    experience: structuredData.experience?.length || 0,
    projectLinks: structuredData.projects?.map(p => ({ 
        name: p.name, 
        link: p.link,           // CHANGE: Show actual URL
        github: p.github,       // CHANGE: Show actual URL
        liveDemo: p.liveDemo    // CHANGE: Show actual URL
    }))
})


        // Generate HTML
        const { generateResumeHTML } = require('../services/resumeTemplate.service')
        const html = generateResumeHTML(structuredData)
        
        // Generate PDF
        const puppeteer = require('puppeteer')
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        })
        
        const page = await browser.newPage()
        await page.setContent(html, { waitUntil: 'networkidle0' })
        
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '0', bottom: '0', left: '0', right: '0' }
        })
        
        await browser.close()
        
        const filename = `${resume.title.replace(/[^a-z0-9]/gi, '_')}_optimized.pdf`
        
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': pdfBuffer.length
        }).send(pdfBuffer)
        
        console.log('✅ PDF generated and sent successfully')
        
    } catch (error) {
        console.error('❌ Download error:', error)
        res.status(500).json({ 
            success: false, 
            message: "Failed to generate download",
            error: error.message
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
