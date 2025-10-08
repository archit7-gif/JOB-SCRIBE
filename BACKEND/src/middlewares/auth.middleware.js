
const jwt = require('jsonwebtoken')
const userModel = require('../models/user.model')

const authUser = async (req, res, next) => {
    try {
        const token = req.cookies?.token || req.headers.authorization?.split(' ')[1]
        if (!token) return res.status(401).json({ success: false, message: "Authentication required" })

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await userModel.findById(decoded.id).select('-password').lean()
        
        if (!user || !user.isActive) {
            return res.status(401).json({ success: false, message: "User account inactive or not found" })
        }

        req.user = user
        next()
    } catch (error) {
        res.status(401).json({ success: false, message: "Invalid or expired token" })
    }
}

const authAdmin = async (req, res, next) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ success: false, message: "Admin access required" })
    }
    next()
}

module.exports = { authUser, authAdmin }
