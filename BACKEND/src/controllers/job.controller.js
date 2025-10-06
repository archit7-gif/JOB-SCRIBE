
const jobModel = require('../models/job.model')
const { validationResult } = require('express-validator')

const createJob = async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) 
            return res.status(400).json({ success: false, message: "Validation failed" })

        const job = await jobModel.create({
            ...req.body,
            user: req.user.id
        })
        res.status(201).json({ success: true, message: "Job created", data: job })
    } catch (error) {
        res.status(500).json({ success: false, message: "Could not create job" })
    }
}

const getJobs = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, company } = req.query
        const filter = { user: req.user.id }
        if (status) filter.status = status
        if (company) filter.company = new RegExp(company, 'i')

        const jobs = await jobModel.find(filter)
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .sort({ createdAt: -1 })

        const count = await jobModel.countDocuments(filter)
        res.status(200).json({ success: true, data: jobs, count })
    } catch (error) {
        res.status(500).json({ success: false, message: "Could not fetch jobs" })
    }
}

const getJob = async (req, res) => {
    try {
        const job = await jobModel.findOne({ _id: req.params.id, user: req.user.id })
        if (!job) return res.status(404).json({ success: false, message: "Job not found" })
        res.status(200).json({ success: true, data: job })
    } catch (error) {
        res.status(500).json({ success: false, message: "Could not fetch job" })
    }
}

const updateJob = async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty())
            return res.status(400).json({ success: false, message: "Validation failed" })

        const job = await jobModel.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            req.body,
            { new: true }
        )

        if (!job) return res.status(404).json({ success: false, message: "Job not found" })
        res.status(200).json({ success: true, message: "Job updated", data: job })
    } catch (error) {
        res.status(500).json({ success: false, message: "Could not update job" })
    }
}

const deleteJob = async (req, res) => {
    try {
        const job = await jobModel.findOneAndDelete({ _id: req.params.id, user: req.user.id })
        if (!job) return res.status(404).json({ success: false, message: "Job not found" })
        res.status(200).json({ success: true, message: "Job deleted" })
    } catch (error) {
        res.status(500).json({ success: false, message: "Could not delete job" })
    }
}

module.exports = {
    createJob,
    getJobs,
    getJob,
    updateJob,
    deleteJob
}
