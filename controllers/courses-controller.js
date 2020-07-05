const ErrorResponse = require('../utils/errorResponse')
const asynHandler = require('../middleware/async')

const CourseModel = require('../models/Course-model')

// @description  Get all courses for a given bootcamp
// @route GET /api/v1/courses
// @route GET /api/v1/bootcamps/:bootcampId/courses
// @access Public
exports.getCourses = asynHandler(async (req, res, next) => {
    let query

    if (req.params.bootcampId) {
        query = CourseModel.find({
            bootcamp: req.params.bootcampId
        })
    } else {
        query = CourseModel.find()
    }

    const courses = await query
    res.status(200).json({
        success: true,
        count: courses.length,
        data: courses,
    })
})