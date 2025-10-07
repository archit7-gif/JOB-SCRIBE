

const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require('cors')
const helmet = require('helmet')
const { validationResult } = require('express-validator')

const authRoutes = require('./routes/auth.routes')
const jobRoutes = require('./routes/jobs.routes')
const resumeRoutes = require('./routes/resumes.routes')
const noteRoutes = require('./routes/notes.routes')
const adminRoutes = require('./routes/admin.routes')

const app = express()

app.use(helmet())
app.use(express.json({ limit: '10mb' }))
app.use(cookieParser())

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

// Health check endpoint
app.get('/health', (req, res) => {
res.status(200).json({ success: true, message: "JobScribe API is healthy" }) })


app.use('/api/auth', authRoutes)
app.use('/api/jobs', jobRoutes)
app.use('/api/resumes', resumeRoutes)
app.use('/api/notes', noteRoutes)
app.use('/api/admin', adminRoutes)




app.use((req, res, next) => {
const errors = validationResult(req)
if (!errors.isEmpty()) {
const validations = errors.array().map(err => ({
param: err.param,
msg: err.msg,
value: err.value }))
return res.status(400).json({ success: false, message: "Validation failed", errors: validations })}
    
next()
})


// 404 handler
app.use((req, res) => {
res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` })
})

// 500 handler
app.use((err, req, res, next) => {
console.error('Server Error:', err)
res.status(500).json({ success: false, message: 'Internal server error' })})



module.exports = app
