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

// courses routes
router.route('/')
    .get(advancedResults(CourseModel, {
        path: commonValues.BOOTCAMP_REF_IN_COURSES, // name from courses-schema
        select: 'name description' // has to spaces here
    }), getCourses)
    .post(addCourse)

router.route('/:id').get(getCourse).put(updateCourse).delete(deleteCourse)

module.exports = router