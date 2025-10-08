
const jobModel = require('../models/job.model')
const { validationResult } = require('express-validator')

const handleValidation = (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        res.status(400).json({ 
            success: false, 
            message: "Validation failed",
            errors: errors.array().map(({ param, msg }) => ({ field: param, message: msg }))
        })
        return true  // Return true to indicate validation failed
    }
    return false  // Return false to indicate validation passed
}

const createJob = async (req, res) => {
    try {
        if (handleValidation(req, res)) return

        const job = await jobModel.create({ 
            ...req.body, 
            user: req.user._id  // Changed from req.user.id to req.user._id
        })
        
        res.status(201).json({ success: true, data: job })
    } catch (error) {
        console.error('Create job error:', error)  // Temporary logging to see actual error
        res.status(500).json({ success: false, message: "Could not create job" })
    }
}

const getJobs = async (req, res) => {
    try {
        const { status, search } = req.query
        const filter = { user: req.user._id }  // Changed from req.user.id
        
        if (status) filter.status = status
        if (search) filter.$or = [
            { title: new RegExp(search, 'i') },
            { company: new RegExp(search, 'i') }
        ]

        const jobs = await jobModel.find(filter).sort({ updatedAt: -1 }).lean()
        res.status(200).json({ success: true, data: jobs })
    } catch (error) {
        res.status(500).json({ success: false, message: "Could not fetch jobs" })
    }
}

const getJob = async (req, res) => {
    try {
        const job = await jobModel.findOne({ 
            _id: req.params.id, 
            user: req.user._id  // Changed from req.user.id
        }).lean()
        
        if (!job) return res.status(404).json({ success: false, message: "Job not found" })
        res.status(200).json({ success: true, data: job })
    } catch (error) {
        res.status(500).json({ success: false, message: "Could not fetch job" })
    }
}

const updateJob = async (req, res) => {
    try {
        if (handleValidation(req, res)) return
        
        const job = await jobModel.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },  // Changed from req.user.id
            req.body,
            { new: true }
        )
        
        if (!job) return res.status(404).json({ success: false, message: "Job not found" })
        res.status(200).json({ success: true, data: job })
    } catch (error) {
        res.status(500).json({ success: false, message: "Could not update job" })
    }
}

const deleteJob = async (req, res) => {
    try {
        const job = await jobModel.findOneAndDelete({ 
            _id: req.params.id, 
            user: req.user._id  // Changed from req.user.id
        })
        
        if (!job) return res.status(404).json({ success: false, message: "Job not found" })
        res.status(200).json({ success: true, message: "Job deleted" })
    } catch (error) {
        res.status(500).json({ success: false, message: "Could not delete job" })
    }
}

module.exports = { createJob, getJobs, getJob, updateJob, deleteJob }

