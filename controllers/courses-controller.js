const ErrorResponse = require('../utils/errorResponse')
const asynHandler = require('../middleware/async')

const CourseModel = require('../models/Course-model')
const commonValues = require('../utils/common-values')

// @description  Get all courses for a given bootcamp
// @route GET /api/v1/courses
// @route GET /api/v1/bootcamps/:bootcampId/courses
// @access Public
exports.getCourses = asynHandler(async (req, res, next) => {
    let query

    if (req.params.bootcampId) {
        const findObj = {}
        findObj[ commonValues.BOOTCAMP_REF_IN_COURSES ] = req.params.bootcampId

        query = CourseModel.find(findObj)
    } else {
        query = CourseModel.find()//.populate('bootcamp')
            .populate({
                path: commonValues.BOOTCAMP_REF_IN_COURSES, // name from courses-schema
                select: 'name description' // has to spaces here
            })
    }

    const courses = await query
    res.status(200).json({
        success: true,
        count: courses.length,
        data: courses,
    })
})