const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    phone: {
        type: String,
    },
    profile: {
        type: String,
    },
    bio: {
        type: String,
    },
    skills: {
        type: String,
    },

    experience: {
        type: String, // Years of experience
    },
    linkedin: { type: String },
    twitter: { type: String },
    github: { type: String },
    facebook: { type: String },
    instagram: { type: String },
    status: {
        type: Boolean,
        default: true,
    },
    joiningDate: {
        type: Date,
        default: Date.now,
    },
    leavingDate: {
        type: Date,
    },
    location: {
        type: String,
    },
    department: {
        type: String,
    },
    created_at: {
        type: Date,
        default: null
    },
    deleted_at: Date,
    updated_at: {
        type: Date,
        default: Date.now
    }
});

// Middleware to update `updated_at` before saving
teamSchema.pre('save', function (next) {
    this.updated_at = Date.now();
    next();
});

const Team = mongoose.model('Team', teamSchema);

module.exports = Team;
