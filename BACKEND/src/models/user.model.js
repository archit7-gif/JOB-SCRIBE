

const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    fullname: {
        firstname: { type: String, required: true, trim: true },
        lastname: { type: String, required: true, trim: true }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
})

const userModel = mongoose.model("user", userSchema)




module.exports = userModel
