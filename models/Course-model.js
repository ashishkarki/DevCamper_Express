const mongoose = require('mongoose')

const commonValues = require('../utils/common-values')

const CourseSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [ true, 'Please add a Course Title' ]
    },
    description: {
        type: String,
        required: [ true, 'Please add a Course Description' ]
    },
    weeks: {
        type: String,
        required: [ true, 'Please add Number of Weeks' ]
    },
    tuition: {
        type: Number,
        required: [ true, 'Please add a Tuition Cost' ]
    },
    minimumSkill: {
        type: String,
        required: [ true, 'Please add a Minimum Skill' ],
        enum: [ 'beginner', 'intermediate', 'advanced' ]
    },
    scholarshipAvialable: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    bootcamp: {
        type: mongoose.Schema.ObjectId,
        ref: commonValues.BOOTCAMP_MODEL_NAME,
        required: true
    }
})

module.exports = mongoose.model(
    commonValues.COURSE_MODEL_NAME,
    CourseSchema
)