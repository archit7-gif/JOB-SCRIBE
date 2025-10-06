
const userModel = require('../models/user.model')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator')

const JWT_EXPIRE = process.env.JWT_EXPIRE || "24h"

const registerUser = async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: "Validation failed" })
        }

        const { email, password, fullname } = req.body

        const existing = await userModel.findOne({ email })
        if (existing) {
            return res.status(409).json({ success: false, message: "User already exists" })
        }

        const hash = await bcrypt.hash(password, 10)
        const user = await userModel.create({
            email: email.toLowerCase(),
            password: hash,
            fullname: {
                firstname: fullname.firstname,
                lastname: fullname.lastname
            }
        })

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRE })
        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production'
        })

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: user._id,
                email: user.email,
                fullname: user.fullname
            }
        })
    } catch (error) {
        res.status(500).json({ success: false, message: "Registration failed" })
    }
}

const loginUser = async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: "Validation failed" })
        }

        const { email, password } = req.body
        const user = await userModel.findOne({ email: email.toLowerCase() })

        if (!user || !user.isActive) {
            return res.status(401).json({ success: false, message: "Invalid credentials" })
        }

        const valid = await bcrypt.compare(password, user.password)
        if (!valid) {
            return res.status(401).json({ success: false, message: "Invalid credentials" })
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRE })
        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production'
        })

        res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                id: user._id,
                email: user.email,
                fullname: user.fullname,
                role: user.role
            }
        })
    } catch (error) {
        res.status(500).json({ success: false, message: "Login failed" })
    }
}

const getMe = async (req, res) => {
    try {
        const user = await userModel.findById(req.user.id).select("-password")
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" })
        }
        res.status(200).json({ success: true, user })
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
