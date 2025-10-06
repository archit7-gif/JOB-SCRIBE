

const express = require('express')
const { registerUser, loginUser, logoutUser, getMe } = require('../controllers/auth.controller')
const { authUser } = require('../middlewares/auth.middleware')
const { validateUserRegistration, validateUserLogin } = require('../middlewares/validation.middleware')
const { loginRateLimit } = require('../middlewares/rateLimit.middleware')

const router = express.Router()

router.post('/register', validateUserRegistration, registerUser)
router.post('/login', loginRateLimit, validateUserLogin, loginUser)
router.post('/logout', authUser, logoutUser)
router.get('/me', authUser, getMe)

module.exports = router


