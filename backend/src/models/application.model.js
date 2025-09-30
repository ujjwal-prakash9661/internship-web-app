const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    
    internship: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'internship',
        required: true
    },
    
    status: {
        type: String,
        enum: ['viewed', 'applied', 'bookmarked'],
        default: 'viewed'
    },
    
    appliedAt: {
        type: Date,
        default: Date.now
    },
    
    // Track when user first viewed this internship
    viewedAt: {
        type: Date,
        default: Date.now
    },
    
    // Additional metadata
    applicationSource: {
        type: String,
        enum: ['dashboard', 'recommendations', 'search'],
        default: 'dashboard'
    }
}, {
    timestamps: true
});

// Compound index to ensure unique user-internship combination
applicationSchema.index({ user: 1, internship: 1 }, { unique: true });

const Application = mongoose.model('application', applicationSchema);

module.exports = Application;