const ErrorResponse = require('../utils/errorResponse')
const asynHandler = require('../middleware/async')

const CourseModel = require('../models/Course-model')
const commonValues = require('../utils/common-values')
const BootcampModel = require('../models/Bootcamp-model')

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

// @description  Get a single, specified course
// @route GET /api/v1/courses/:id
// @access Public
exports.getCourse = asynHandler(async (req, res, next) => {
    const course = await CourseModel.findById(req.params.id).populate({
        path: commonValues.BOOTCAMP_REF_IN_COURSES,
        select: 'name description'
    })

    if (!course) {
        return next(new ErrorResponse(`No course with the id of ${ req.params.id } found`, 404))
    }

    res.status(200).json({
        success: true,
        data: course,
    })
})

// @description add a course
// @route POST /api/v1/bootcamps/:bootcampId/courses
// @access Private
exports.addCourse = asynHandler(async (req, res, next) => {
    req.body[ commonValues.BOOTCAMP_REF_IN_COURSES ] = req.params[ commonValues.BOOTCAMP_ID_NAME ]

    const bootcamp = await BootcampModel.findById(req.params[ commonValues.BOOTCAMP_ID_NAME ])

    if (!bootcamp) {
        return next(new ErrorResponse(`No Bootcamp with the id of ${ req.params[ commonValues.BOOTCAMP_ID_NAME ] } found`, 404))
    }

    const newCourse = await CourseModel.create(req.body)

    res.status(200).json({
        success: true,
        data: newCourse,
    })
})

// @description UPDATE a course
// @route PUT /api/v1/courses/:id
// @access Private
exports.updateCourse = asynHandler(async (req, res, next) => {
    let updatedCourse = await CourseModel.findById(req.params.id)

    if (!updatedCourse) {
        return next(new ErrorResponse(`No Course with the id of ${ req.params.id } found`, 404))
    }

    updatedCourse = await CourseModel.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        success: true,
        data: updatedCourse,
    })
})

// @description DELETE a course
// @route DELETE /api/v1/courses/:id
// @access Private
exports.deleteCourse = asynHandler(async (req, res, next) => {
    const deletedCourse = await CourseModel.findById(req.params.id)

    if (!deletedCourse) {
        return next(new ErrorResponse(`No Course with the id of ${ req.params.id } found`, 404))
    }

    await deletedCourse.remove()

    res.status(200).json({
        success: true,
        data: {},
    })
})