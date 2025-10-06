

const jwt = require('jsonwebtoken')
const userModel = require('../models/user.model')

// Authenticate regular user
const authUser = async (req, res, next) => {
    try {
        const token = req.cookies.token
        if (!token)
            return res.status(401).json({ success: false, message: "Authentication required" })

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await userModel.findById(decoded.id)
        if (!user || !user.isActive)
            return res.status(401).json({ success: false, message: "User account inactive or not found" })

        req.user = { id: user._id, role: user.role }
        next()
    } catch (error) {
        res.status(401).json({ success: false, message: "Invalid token" })
    }
}

// Authenticate admin user
const authAdmin = async (req, res, next) => {
    await authUser(req, res, async () => {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Admin privilege required" })
        }
        next()
    })
}

module.exports = { authUser, authAdmin }
