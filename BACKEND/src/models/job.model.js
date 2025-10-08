

const mongoose = require('mongoose')

const jobSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true, index: true },
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    link: { type: String, trim: true },
    description: { type: String, trim: true },
    location: { type: String, trim: true },
    status: {
        type: String,
        enum: ['saved', 'applied', 'interviewing', 'offer', 'rejected'],
        default: 'saved'
    }
}, {
    timestamps: true
})

jobSchema.index({ user: 1, updatedAt: -1 })
jobSchema.index({ user: 1, status: 1 })
jobSchema.index({ user: 1, company: 'text', title: 'text' }) // Full-text search

const jobModel = mongoose.model('job', jobSchema)
module.exports = jobModel
