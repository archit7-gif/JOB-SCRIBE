const noteModel = require('../models/note.model')
const { validationResult } = require('express-validator')
const marked = require('marked')

const handleValidation = (req, res) => {
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

const createNote = async (req, res) => {
    try {
        if (handleValidation(req, res)) return

        const note = await noteModel.create({
            ...req.body,
            user: req.user._id,  // FIXED: changed from req.user.id
            contentHTML: marked.parse(req.body.content)
        })

        res.status(201).json({ success: true, data: note })
    } catch (error) {
        res.status(500).json({ success: false, message: "Could not create note" })
    }
}

const getNotesByJob = async (req, res) => {
    try {
        const notes = await noteModel
            .find({ user: req.user._id, jobId: req.params.jobId })  // FIXED
            .sort({ createdAt: -1 })
            .lean()
        
        res.status(200).json({ success: true, data: notes })
    } catch (error) {
        res.status(500).json({ success: false, message: "Could not fetch notes" })
    }
}

const getNote = async (req, res) => {
    try {
        const note = await noteModel
            .findOne({ _id: req.params.id, user: req.user._id })  // FIXED
            .lean()
        
        if (!note) return res.status(404).json({ success: false, message: "Note not found" })
        res.status(200).json({ success: true, data: note })
    } catch (error) {
        res.status(500).json({ success: false, message: "Could not fetch note" })
    }
}

const getAllNotes = async (req, res) => {
    try {
        const { page = 1, limit = 10, search } = req.query
        const filter = { user: req.user._id }  // FIXED
        
        if (search) {
            filter.$or = [
                { title: new RegExp(search, 'i') },
                { content: new RegExp(search, 'i') }
            ]
        }

        const skip = (page - 1) * limit

        const [notes, count] = await Promise.all([
            noteModel.find(filter)
                .skip(skip)
                .limit(Number(limit))
                .sort({ updatedAt: -1 })
                .lean(),
            noteModel.countDocuments(filter)
        ])

        res.status(200).json({ success: true, data: notes, count })
    } catch (error) {
        res.status(500).json({ success: false, message: "Could not fetch notes" })
    }
}

const updateNote = async (req, res) => {
    try {
        if (handleValidation(req, res)) return

        const update = { ...req.body }
        if (req.body.content) update.contentHTML = marked.parse(req.body.content)

        const note = await noteModel.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },  // FIXED
            update,
            { new: true }
        )
        
        if (!note) return res.status(404).json({ success: false, message: "Note not found" })
        res.status(200).json({ success: true, data: note })
    } catch (error) {
        res.status(500).json({ success: false, message: "Could not update note" })
    }
}

const deleteNote = async (req, res) => {
    try {
        const note = await noteModel.findOneAndDelete({ 
            _id: req.params.id, 
            user: req.user._id  // FIXED
        })
        
        if (!note) return res.status(404).json({ success: false, message: "Note not found" })
        res.status(200).json({ success: true, message: "Note deleted" })
    } catch (error) {
        res.status(500).json({ success: false, message: "Could not delete note" })
    }
}

module.exports = {
    createNote,
    getNotesByJob,
    getNote,
    getAllNotes,
    updateNote,
    deleteNote
}
