const express = require('express')

const commonValues = require('../utils/common-values')

const {
    getBootcamps,
    getBootcamp,
    createBootcamp,
    updateBootcamp,
    deleteBootcamp,
    getBootcampsInRadius,
    bootcampPhotoUpload,
} = require('../controllers/bootcamps-controller')

const BootcampModel = require('../models/Bootcamp-model')

const advancedResults = require('../middleware/advancedResults')

// include other resource routers
const coursesRouter = require('./courses-routes')

// define the bootcamps router
const router = express.Router()

const { protect } = require('../middleware/auth-middleware')

// Re-route into other resource routers
router.use('/:bootcampId/courses', coursesRouter)

// bootcamps's routes
router.route('/radius/:zipcode/:distance')
    .get(getBootcampsInRadius)

router.route('/')
    .get(
        advancedResults(
            BootcampModel,
            commonValues.COURSES_VIRTUAL_NAME
        ),
        getBootcamps
    )
    .post(protect, createBootcamp)

router.route('/:id')
    .get(getBootcamp)
    .put(protect, updateBootcamp)
    .delete(protect, deleteBootcamp)

router.route('/:id/photo')
    .put(protect, bootcampPhotoUpload)

module.exports = router
