const mongoose = require('mongoose')

const commonValues = require('../utils/common-values')

const schemaObject = {
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
    }
}

schemaObject[ commonValues.BOOTCAMP_REF_IN_COURSES ] = {
    type: mongoose.Schema.ObjectId,
    ref: commonValues.BOOTCAMP_MODEL_NAME,
    required: true
}

const CourseSchema = new mongoose.Schema(schemaObject)

// Static method on CourseSchema to get avg of tuitions
CourseSchema.statics.getAverageCost = async function (bootcampId) {
    const aggregateObj = await this.aggregate([
        {
            $match: { bootcamp: bootcampId }
        },
        {
            $group: {
                _id: '$bootcamp',
                averageCost: { $avg: '$tuition' }
            }
        }
    ])

    try {
        await this.model(commonValues.BOOTCAMP_MODEL_NAME).findByIdAndUpdate(bootcampId, {
            averageCost: Math.ceil(aggregateObj[ 0 ].averageCost)
        })
    } catch (error) {
        console.error(error)
    }
}

// Call getAverageCost after saving a course
CourseSchema.post(('save'), function () {
    this.constructor.getAverageCost(this.bootcamp)
})

// Call getAverageCost before removing a course
CourseSchema.pre(('remove'), function () {
    this.constructor.getAverageCost(this.bootcamp)
})

// expose course model
module.exports = mongoose.model(
    commonValues.COURSE_MODEL_NAME,
    CourseSchema
)