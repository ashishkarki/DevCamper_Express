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
    if (req.params.bootcampId) {
        const findObj = {}
        findObj[ commonValues.BOOTCAMP_REF_ELSEWHERE ] = req.params.bootcampId

        const courses = await CourseModel.find(findObj)

        res.status(200).json({
            success: true,
            count: courses.length,
            data: courses,
        })
    } else {
        res.status(200).json(res.advancedResults)
    }
})

// @description  Get a single, specified course
// @route GET /api/v1/courses/:id
// @access Public
exports.getCourse = asynHandler(async (req, res, next) => {
    const course = await CourseModel.findById(req.params.id).populate({
        path: commonValues.BOOTCAMP_REF_ELSEWHERE,
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
    req.body[ commonValues.BOOTCAMP_REF_ELSEWHERE ] = req.params[ commonValues.BOOTCAMP_ID_NAME ]
    req.body[ commonValues.USER_REF_ELSEWHERE ] = req.user.id

    const bootcamp = await BootcampModel.findById(req.params[ commonValues.BOOTCAMP_ID_NAME ])

    if (!bootcamp) {
        return next(new ErrorResponse(`No Bootcamp with the id of ${ req.params[ commonValues.BOOTCAMP_ID_NAME ] } found`, 404))
    }

    // Make sure current user is the bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== commonValues.ROLE_NAMES.ADMIN) {
        return next(new ErrorResponse(`User with id ${ req.user.id } is not the owner or an admin and is not authorized to add/update/delete course to bootcamp with id ${ bootcamp._id }`, 401))
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

    // Make sure current user is the course owner
    if (updatedCourse.user.toString() !== req.user.id && req.user.role !== commonValues.ROLE_NAMES.ADMIN) {
        return next(new ErrorResponse(`User with id ${ req.user.id } is not the owner or an admin and is not authorized to update course with id ${ updatedCourse._id }`, 401))
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

    // Make sure current user is the course owner
    if (deletedCourse.user.toString() !== req.user.id && req.user.role !== commonValues.ROLE_NAMES.ADMIN) {
        return next(new ErrorResponse(`User with id ${ req.user.id } is not the owner or an admin and is not authorized to delete course with id ${ deletedCourse._id }`, 401))
    }

    await deletedCourse.remove()

    res.status(200).json({
        success: true,
        data: {},
    })
})