const userModel = require('../models/user.model')

const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20, search } = req.query
        const filter = {}
        
        if (search) filter.$or = [
            { "fullname.firstname": new RegExp(search, 'i') },
            { "fullname.lastname": new RegExp(search, 'i') },
            { email: new RegExp(search, 'i') }
        ]

        const [users, count] = await Promise.all([
            userModel.find(filter)
                .skip((page - 1) * limit)
                .limit(Number(limit))
                .select("-password")
                .sort({ createdAt: -1 })
                .lean(),
            userModel.countDocuments(filter)
        ])

        res.status(200).json({ success: true, data: users, count })
    } catch (error) {
        res.status(500).json({ success: false, message: "Could not fetch users" })
    }
}

const getUser = async (req, res) => {
    try {
        const user = await userModel.findById(req.params.userId).select("-password").lean()
        if (!user) return res.status(404).json({ success: false, message: "User not found" })
        res.status(200).json({ success: true, data: user })
    } catch (error) {
        res.status(500).json({ success: false, message: "Could not fetch user" })
    }
}

const updateUserStatus = async (req, res) => {
    try {
        // FIXED: changed from req.user.id to req.user._id
        if (req.params.userId === req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Cannot modify your own account status" })
        }

        const { isActive } = req.body
        const user = await userModel.findByIdAndUpdate(
            req.params.userId,
            { isActive },
            { new: true }
        ).select("-password")
        
        if (!user) return res.status(404).json({ success: false, message: "User not found" })
        
        res.status(200).json({ 
            success: true, 
            message: `User ${isActive ? 'activated' : 'deactivated'}`,
            data: user 
        })
    } catch (error) {
        res.status(500).json({ success: false, message: "Could not update user status" })
    }
}

const deleteUser = async (req, res) => {
    try {
        // FIXED: changed from req.user.id to req.user._id
        if (req.params.userId === req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Cannot delete your own account" })
        }

        const user = await userModel.findByIdAndDelete(req.params.userId)
        if (!user) return res.status(404).json({ success: false, message: "User not found" })
        
        res.status(200).json({ success: true, message: "User deleted" })
    } catch (error) {
        res.status(500).json({ success: false, message: "Could not delete user" })
    }
}

const getSystemStats = async (req, res) => {
    try {
        const [total, active, inactive] = await Promise.all([
            userModel.countDocuments(),
            userModel.countDocuments({ isActive: true }),
            userModel.countDocuments({ isActive: false })
        ])
        
        res.status(200).json({ 
            success: true, 
            stats: { totalUsers: total, activeUsers: active, inactiveUsers: inactive } 
        })
    } catch (error) {
        res.status(500).json({ success: false, message: "Could not fetch stats" })
    }
}

module.exports = { getAllUsers, getUser, updateUserStatus, deleteUser, getSystemStats }



// job id : 68e6402b7fe9ee047c028e14
// resumeid: 68e6494143062fd727520e2f
// analysis id : 68e67028c9613eb3872ffb1c
// optimization id: 68e67163f79d726250f4ade9
// note id : 68e6773dc1780d94a9a566fa
// note id 2 : 68e67a443cb5908b02816e50