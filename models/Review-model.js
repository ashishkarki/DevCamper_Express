const mongoose = require('mongoose')

const commonValues = require('../utils/common-values')

const schemaObject = {
    title: {
        type: String,
        trim: true,
        required: [ true, 'Please add a Title for the Review' ],
        maxlength: 100,
    },
    text: {
        type: String,
        required: [ true, 'Please add some review text' ]
    },
    rating: {
        type: Number,
        min: 1,
        max: 10,
        required: [ true, 'Please add a rating between 1 and 10' ]
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}

schemaObject[ commonValues.BOOTCAMP_REF_ELSEWHERE ] = {
    type: mongoose.Schema.ObjectId,
    ref: commonValues.BOOTCAMP_MODEL_NAME,
    required: true
}

schemaObject[ commonValues.USER_REF_ELSEWHERE ] = {
    type: mongoose.Schema.ObjectId,
    ref: commonValues.USER_MODEL_NAME,
    required: true
}

const ReviewSchema = new mongoose.Schema(schemaObject)

// One User (for a given bootcamp) can create only one review
ReviewSchema.index(
    { bootcamp: 1, user: 1 },
    { unique: true }
)
// expose course model
module.exports = mongoose.model(
    commonValues.REVIEW_MODEL_NAME,
    ReviewSchema
)