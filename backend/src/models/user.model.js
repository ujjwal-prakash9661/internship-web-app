const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String
    },

    githubId: {
        type: String
    },

    githubUsername: {
        type: String
    },

    avatar: {
        type: String
    },

    skills : {
        type : [String],
        default : []
    },

    provider : {
        type : String,
        enum : ['local', 'github'],
        default : 'local'
    },

    // User preferences for personalization
    preferences: {
        preferredLocations: {
            type: [String],
            default: []
        },
        preferredStipendRange: {
            min: { type: Number, default: 0 },
            max: { type: Number, default: 100000 }
        },
        preferredDuration: {
            type: [String],
            default: []
        },
        preferredType: {
            type: [String], // remote, onsite, hybrid
            default: []
        }
    },

    // Track user activity
    activity: {
        lastLoginAt: {
            type: Date,
            default: Date.now
        },
        totalApplications: {
            type: Number,
            default: 0
        },
        totalViews: {
            type: Number,
            default: 0
        }
    }
},
    {
        timestamps : true
    }
)

const userModel = mongoose.model('user', userSchema)

module.exports = userModel