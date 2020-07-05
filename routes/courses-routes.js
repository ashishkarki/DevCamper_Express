const express = require('express')

const {
    getCourses
} = require('../controllers/courses-controller')

// courses's router
const router = express.Router({ mergeParams: true }) // merge params from other router re-directions


// courses routes
router.route('/').get(getCourses)

module.exports = router

// 6.1 => 7. Courses Routes