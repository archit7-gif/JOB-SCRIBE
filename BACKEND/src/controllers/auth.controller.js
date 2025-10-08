
const userModel = require('../models/user.model')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator')

const JWT_EXPIRE = process.env.JWT_EXPIRE || "24h"
const COOKIE_MAX_AGE = 24 * 60 * 60 * 1000

const handleValidation = (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: "Validation failed" })
    }
}

const setCookie = (res, token) => {
    res.cookie('token', token, {
        httpOnly: true,
        maxAge: COOKIE_MAX_AGE,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
    })
}

const registerUser = async (req, res) => {
    try {
        if (handleValidation(req, res)) return

        const { email, password, fullname } = req.body

        const existing = await userModel.findOne({ email: email.toLowerCase() }).lean()
        if (existing) {
            return res.status(409).json({ success: false, message: "User already exists" })
        }

        const hash = await bcrypt.hash(password, 10)
        const user = await userModel.create({
            email: email.toLowerCase(),
            password: hash,
            fullname
        })

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRE })
        setCookie(res, token)

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: user._id,
                email: user.email,
                fullname: user.fullname,
                role: user.role
            },
            token
        })
    } catch (error) {
        res.status(500).json({ success: false, message: "Registration failed" })
    }
}

const loginUser = async (req, res) => {
    try {
        if (handleValidation(req, res)) return

        const { email, password } = req.body
        const user = await userModel.findOne({ email: email.toLowerCase() }).select('+password')

        if (!user || !user.isActive) {
            return res.status(401).json({ success: false, message: "Invalid credentials" })
        }

        const valid = await bcrypt.compare(password, user.password)
        if (!valid) {
            return res.status(401).json({ success: false, message: "Invalid credentials" })
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRE })
        setCookie(res, token)

        res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                id: user._id,
                email: user.email,
                fullname: user.fullname,
                role: user.role
            },
            token
        })
    } catch (error) {
        res.status(500).json({ success: false, message: "Login failed" })
    }
}

const getMe = async (req, res) => {
    try {
        res.status(200).json({ success: true, user: req.user })
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch user" })
    }
}


const logoutUser = async (req, res) => {
    res.clearCookie("token")
    res.status(200).json({ success: true, message: "Logout successful" })
}

module.exports = {
    registerUser,
    loginUser,
    getMe,
    logoutUser
}
