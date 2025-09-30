const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },

    company: {
        type: String,
        required: true,
    },

    location: {
        type: String,
        required: true,
    },

    stipend: {
        type: String,
    },

    description: {
        type: String,
        required: true,
    },

    requiredSkills: {
        type: [String],
        required: true,
    },

    source: {
        type: String, // e.g., 'Internshala', 'LinkedIn'
    },

    applyLink: {
        type: String,
        required: true,
    }
}, { timestamps: true })

const internshipModel = mongoose.model('internship',internshipSchema)

module.exports = internshipModel;