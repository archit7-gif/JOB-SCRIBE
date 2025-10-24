

const rateLimit = require('express-rate-limit')
const { ipKeyGenerator } = require('express-rate-limit') 

// 5 login attempts per 15 minutes
const loginRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: { 
        success: false, 
        message: 'Too many login attempts. Please try again in 15 minutes.' 
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Too many login attempts. Please try again in 15 minutes.',
            retryAfter: '15 minutes'
        })
    }
})

// AI Analysis/Optimization: STRICT - 5 requests per 15 minutes per user
const aiAnalysisRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { 
        success: false, 
        message: 'AI rate limit exceeded. You can make 5 optimization requests per 15 minutes.' 
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        const resetTime = req.rateLimit?.resetTime ? new Date(req.rateLimit.resetTime) : null
        const minutesLeft = resetTime ? Math.ceil((resetTime - Date.now()) / 1000 / 60) : 15
        
        res.status(429).json({
            success: false,
            message: `AI rate limit exceeded. You've made ${req.rateLimit.limit} requests in the last 15 minutes.`,
            retryAfter: `${minutesLeft} minutes`,
            limit: req.rateLimit.limit,
            remaining: req.rateLimit.remaining,
            resetTime: resetTime ? resetTime.toISOString() : null
        })
    },
    keyGenerator: (req) => {
        
        return req.user?._id?.toString() || ipKeyGenerator(req)
    }
})

// File Upload: 15 uploads per 30 minutes per user
const uploadRateLimit = rateLimit({
    windowMs: 30 * 60 * 1000,
    max: 15,
    message: { 
        success: false, 
        message: 'Upload limit reached. Please try again in 30 minutes.' 
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Too many file uploads. Please wait before uploading again.',
            retryAfter: '30 minutes'
        })
    },
    keyGenerator: (req) => {
        
        return req.user?._id?.toString() || ipKeyGenerator(req)
    }
})

module.exports = {
    loginRateLimit,
    aiAnalysisRateLimit,
    uploadRateLimit
}
