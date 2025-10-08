

const express = require('express')
const {
    getAllUsers,
    getUser,
    updateUserStatus,
    deleteUser,
    getSystemStats
} = require('../controllers/admin.controller')
const { authAdmin, authUser } = require('../middlewares/auth.middleware')
const { validateUserStatusUpdate } = require('../middlewares/validation.middleware')

const router = express.Router()

router.use(authUser,authAdmin)

router.get('/users', getAllUsers)
router.get('/users/:userId', getUser)
router.put('/users/:userId/status', validateUserStatusUpdate, updateUserStatus)
router.delete('/users/:userId', deleteUser)
router.get('/stats', getSystemStats)

module.exports = router
