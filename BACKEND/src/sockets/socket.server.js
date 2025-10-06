

const { Server } = require("socket.io")
const cookie = require('cookie')
const jwt = require('jsonwebtoken')
const userModel = require('../models/user.model')

const initSocketServer = (httpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:5173",
            credentials: true,
            methods: ["GET", "POST"]
        },
        transports: ['websocket', 'polling'],
        allowEIO3: true
    })

    // Socket authentication middleware
    io.use(async (socket, next) => {
        try {
            const cookies = cookie.parse(socket.handshake.headers?.cookie || "")
            if (!cookies.token) {
                return next(new Error("Authentication error: No token provided"))
            }

            const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET)
            const user = await userModel.findById(decoded.id).select("-password")

            if (!user || !user.isActive) {
                return next(new Error("Authentication error: User not found or inactive"))
            }

            socket.user = user
            next()
        } catch (error) {
            next(new Error("Authentication error: Invalid token"))
        }
    })

    io.on("connection", (socket) => {
        console.log(`👤 User connected: ${socket.user.email}`)

        // Join user personal room
        socket.join(`user_${socket.user._id}`)

        socket.on("job-status-update", (data) => {
            io.to(`user_${socket.user._id}`).emit("job-status-updated", {
                jobId: data.jobId,
                status: data.status,
                timestamp: new Date()
            })
        })

        socket.on("note-created", (data) => {
            io.to(`user_${socket.user._id}`).emit("note-added", {
                noteId: data.noteId,
                jobId: data.jobId,
                title: data.title,
                timestamp: new Date()
            })
        })

        socket.on("resume-analysis-complete", (data) => {
            io.to(`user_${socket.user._id}`).emit("resume-ready", {
                resumeId: data.resumeId,
                matchScore: data.analysisResult.matchScore,
                suggestions: data.analysisResult.suggestions,
                timestamp: new Date()
            })
        })

        socket.on("disconnect", (reason) => {
            console.log(`👋 User disconnected: ${socket.user.email} - Reason: ${reason}`)
        })
    })

    io.engine.on("connection_error", (err) => {
        console.log("Socket connection error:", err.req)
        console.log("Error code:", err.code)
        console.log("Error message:", err.message)
        console.log("Error context:", err.context)
    })

    console.log("🔌 Socket.IO server initialized")
    return io
}

module.exports = initSocketServer
