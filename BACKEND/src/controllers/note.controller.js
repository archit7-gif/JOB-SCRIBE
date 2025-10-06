

const noteModel = require('../models/note.model')
const { validationResult } = require('express-validator')
const marked = require('marked')

const createNote = async (req, res) => {
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

        const note = await noteModel.create({
            ...req.body,
            user: req.user.id,
            contentHTML: marked.parse(req.body.content)
        })

        res.status(201).json({ success: true, data: note })
    } catch (error) {
        console.error('Create note error:', error)
        res.status(500).json({ success: false, message: "Could not create note" })
    }
}

const getNotesByJob = async (req, res) => {
    try {
        const notes = await noteModel.find({ user: req.user.id, jobId: req.params.jobId })
        res.status(200).json({ success: true, data: notes })
    } catch (error) {
        res.status(500).json({ success: false, message: "Could not fetch notes" })
    }
}

const getNote = async (req, res) => {
    try {
        const note = await noteModel.findOne({ _id: req.params.id, user: req.user.id })
        if (!note) return res.status(404).json({ success: false, message: "Note not found" })
        res.status(200).json({ success: true, data: note })
    } catch (error) {
        res.status(500).json({ success: false, message: "Could not fetch note" })
    }
}

const getAllNotes = async (req, res) => {
    try {
        const { page = 1, limit = 10, search } = req.query
        let filter = { user: req.user.id }
        if (search) {
            filter.$or = [
                { title: new RegExp(search, 'i') },
                { content: new RegExp(search, 'i') }
            ]
        }
        const notes = await noteModel.find(filter)
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .sort({ updatedAt: -1 })

        const count = await noteModel.countDocuments(filter)
        res.status(200).json({ success: true, data: notes, count })
    } catch (error) {
        res.status(500).json({ success: false, message: "Could not fetch notes" })
    }
}

const updateNote = async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, message: "Validation failed" })

        const update = {
            ...req.body,
            contentHTML: req.body.content ? marked.parse(req.body.content) : undefined
        }
        const note = await noteModel.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
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
        const note = await noteModel.findOneAndDelete({ _id: req.params.id, user: req.user.id })
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
