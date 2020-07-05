const express = require('express')
const router = express.Router()

const {
    getCourses
} = require('../controllers/courses-controller')

router.route('/').get(getCourses)

module.exports = router

// 6.1 => 7. Courses Routes