const express = require('express')

const {
    getCourses,
    getCourse,
    addCourse,
    updateCourse,
    deleteCourse
} = require('../controllers/courses-controller')

const commonValues = require('../utils/common-values')

// course model  
const CourseModel = require('../models/Course-model')

const advancedResults = require('../middleware/advancedResults')

// courses's router
const router = express.Router({ mergeParams: true }) // merge params from other router re-directions

const { protect, authorize } = require('../middleware/auth-middleware')

// courses routes
router.route('/')
    .get(advancedResults(CourseModel, {
        path: commonValues.BOOTCAMP_REF_IN_COURSES, // name from courses-schema
        select: 'name description' // has to spaces here
    }), getCourses)
    .post(protect, authorize('publisher', 'admin'), addCourse)

router.route('/:id')
    .get(getCourse)
    .put(protect, authorize('publisher', 'admin'), updateCourse)
    .delete(protect, authorize('publisher', 'admin'), deleteCourse)

module.exports = router