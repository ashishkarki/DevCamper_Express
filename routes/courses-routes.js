const express = require('express')

const {
    getCourses,
    getCourse,
    addCourse,
    updateCourse,
    deleteCourse
} = require('../controllers/courses-controller')

// courses's router
const router = express.Router({ mergeParams: true }) // merge params from other router re-directions

// courses routes
router.route('/').get(getCourses).post(addCourse)
router.route('/:id').get(getCourse).put(updateCourse).delete(deleteCourse)

module.exports = router