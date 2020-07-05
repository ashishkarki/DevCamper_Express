const express = require('express')

const {
    getBootcamps,
    getBootcamp,
    createBootcamp,
    updateBootcamp,
    deleteBootcamp,
    getBootcampsInRadius,
    bootcampPhotoUpload,
} = require('../controllers/bootcamps-controller')

// include other resource routers
const coursesRouter = require('./courses-routes')

// define the bootcamps router
const router = express.Router()

// Re-route into other resource routers
router.use('/:bootcampId/courses', coursesRouter)

// bootcamps's routes
router.route('/radius/:zipcode/:distance')
    .get(getBootcampsInRadius)

router.route('/')
    .get(getBootcamps)
    .post(createBootcamp)

router.route('/:id')
    .get(getBootcamp)
    .put(updateBootcamp)
    .delete(deleteBootcamp)

router.route('/:id/photo')
    .put(bootcampPhotoUpload)

module.exports = router
