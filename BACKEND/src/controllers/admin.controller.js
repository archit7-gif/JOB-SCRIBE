

const userModel = require('../models/user.model')

const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20, search } = req.query
        let filter = {}
        if (search) {
            filter.$or = [
                { "fullname.firstname": new RegExp(search, 'i') },
                { "fullname.lastname": new RegExp(search, 'i') },
                { email: new RegExp(search, 'i') }
            ]
        }
        const users = await userModel.find(filter)
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .select("-password")
            .sort({ createdAt: -1 })
        const count = await userModel.countDocuments(filter)
        res.status(200).json({ success: true, data: users, count })
    } catch (error) {
        res.status(500).json({ success: false, message: "Could not fetch users" })
    }
}

const getUser = async (req, res) => {
    try {
        const user = await userModel.findById(req.params.userId).select("-password")
        if (!user) return res.status(404).json({ success: false, message: "User not found" })
        res.status(200).json({ success: true, data: user })
    } catch (error) {
        res.status(500).json({ success: false, message: "Could not fetch user" })
    }
}

const updateUserStatus = async (req, res) => {
    try {
        const { isActive } = req.body
        const user = await userModel.findByIdAndUpdate(
            req.params.userId,
            { isActive },
            { new: true }
        ).select("-password")
        if (!user) return res.status(404).json({ success: false, message: "User not found" })
        res.status(200).json({ success: true, data: user })
    } catch (error) {
        res.status(500).json({ success: false, message: "Could not update user status" })
    }
}

const deleteUser = async (req, res) => {
    try {
        const user = await userModel.findByIdAndDelete(req.params.userId)
        if (!user) return res.status(404).json({ success: false, message: "User not found" })
        res.status(200).json({ success: true, message: "User deleted" })
    } catch (error) {
        res.status(500).json({ success: false, message: "Could not delete user" })
    }
}

const getSystemStats = async (req, res) => {
    try {
        const users = await userModel.countDocuments()
        // You can add more stats (jobs, resumes etc) if needed
        res.status(200).json({ success: true, stats: { users } })
    } catch (error) {
        res.status(500).json({ success: false, message: "Could not fetch stats" })
    }
}

module.exports = {
    getAllUsers,
    getUser,
    updateUserStatus,
    deleteUser,
    getSystemStats
}
