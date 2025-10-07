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
    
    // AI Analysis history (Step 1: Suggestions)
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
    
    // AI Optimization history (Step 2: Optimized resumes)
    optimizations: [{
        analysisId: mongoose.Schema.Types.ObjectId,  // Links to aiAnalyses
        jobDescription: String,
        jobDescHash: String,
        jobTitle: String,
        originalContent: String,
        optimizedContent: String,
        appliedSuggestions: [String],
        createdAt: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true
})

resumeSchema.index({ user: 1, contentHash: 1 })

const resumeModel = mongoose.model('resume', resumeSchema)


module.exports = resumeModel

