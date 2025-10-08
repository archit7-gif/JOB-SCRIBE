

const mongoose = require('mongoose')

const noteSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true, index: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "job", required: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    contentHTML: { type: String }
}, {
    timestamps: true
})

noteSchema.index({ user: 1, jobId: 1 })
noteSchema.index({ user: 1, createdAt: -1 })




const noteModel = mongoose.model('note', noteSchema)


module.exports = noteModel

