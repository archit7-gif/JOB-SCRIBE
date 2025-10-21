

const mongoose = require('mongoose')

const resumeSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true, index: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    contentHash: { type: String, index: true },
    type: { type: String, enum: ['text', 'file'], required: true },
    fileName: { type: String },
    fileSize: { type: Number },
    mimeType: { type: String },
    
    // NEW: Store extracted links from original resume
    extractedLinks: {
        personalInfo: {
            linkedin: String,
            github: String,
            twitter: String,
            portfolio: String,
            email: String
        },
        projects: [{
            name: String,
            link: String,
            github: String,
            liveDemo: String,
            demo: String,
            url: String
        }]
    },
    
    // AI Analysis history
    aiAnalyses: [{
        jobDescription: String,
        jobDescHash: String,
        jobTitle: String,
        matchScore: Number,
        strengths: [String],
        suggestions: [String],
        missingKeywords: [String],
        sectionsToImprove: [String],
        createdAt: { type: Date, default: Date.now }
    }],
    
    // AI Optimization history
optimizations: [{
    analysisId: mongoose.Schema.Types.ObjectId,
    jobDescription: String,
    jobDescHash: String,
    jobTitle: String,
    originalContent: String,
    optimizedContent: String,
    appliedSuggestions: [String],
    
    // NEW: Store structured version at optimization time
    structuredData: {
        personalInfo: Object,
        summary: String,
        skills: Object,
        experience: Array,
        projects: Array,
        education: Array,
        certifications: Array,
        languages: Array
    },
    
    createdAt: { type: Date, default: Date.now }
}]

}, {
    timestamps: true
})

resumeSchema.index({ user: 1, contentHash: 1 })
resumeSchema.index({ user: 1, updatedAt: -1 })
resumeSchema.index({ user: 1, type: 1 })
resumeSchema.index({ 'aiAnalyses.jobDescHash': 1 })
resumeSchema.index({ 'optimizations.jobDescHash': 1 })

const resumeModel = mongoose.model('resume', resumeSchema)

module.exports = resumeModel


