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

const { protect } = require('../middleware/auth-middleware')

// courses routes
router.route('/')
    .get(advancedResults(CourseModel, {
        path: commonValues.BOOTCAMP_REF_IN_COURSES, // name from courses-schema
        select: 'name description' // has to spaces here
    }), getCourses)
    .post(protect, addCourse)

router.route('/:id')
    .get(getCourse)
    .put(protect, updateCourse)
    .delete(protect, deleteCourse)

module.exports = router