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
const reviewsRouter = require('./reviews-routes')

// define the bootcamps router
const router = express.Router()

const { protect, authorize } = require('../middleware/auth-middleware')

// Re-route into other resource routers
router.use('/:bootcampId/courses', coursesRouter)
router.use(`/:${ commonValues.BOOTCAMP_ID_NAME }/reviews`, reviewsRouter)

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
    .post(protect, authorize(commonValues.ROLE_NAMES.PUBLISHER, commonValues.ROLE_NAMES.ADMIN), createBootcamp)

router.route('/:id')
    .get(getBootcamp)
    .put(protect, authorize(commonValues.ROLE_NAMES.PUBLISHER, commonValues.ROLE_NAMES.ADMIN), updateBootcamp)
    .delete(protect, authorize(commonValues.ROLE_NAMES.PUBLISHER, commonValues.ROLE_NAMES.ADMIN), deleteBootcamp)

router.route('/:id/photo')
    .put(protect, authorize(commonValues.ROLE_NAMES.PUBLISHER, commonValues.ROLE_NAMES.ADMIN), bootcampPhotoUpload)

module.exports = router
