

const rateLimit = require('express-rate-limit')

// 5 tries per 15 minutes for login
const loginRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { success: false, message: 'Too many login attempts, try again in 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false
})

// Resume AI analysis: 10 per hour per user
const aiAnalysisRateLimit = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: parseInt(process.env.AI_RATE_LIMIT_MAX) || 10,
    message: { success: false, message: 'AI analysis limit reached, try again later' }
})

// Resume file upload: 20 per hour per user
const uploadRateLimit = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 20,
    message: { success: false, message: 'Upload limit reached, try again later' }
})

module.exports = {
    loginRateLimit,
    aiAnalysisRateLimit,
    uploadRateLimit
}
