const express = require('express')

const {
    getReviews,
} = require('../controllers/reviews-controller')

const commonValues = require('../utils/common-values')

// course model  
const ReviewModel = require('../models/Review-model')

const advancedResults = require('../middleware/advancedResults')

// courses's router
const router = express.Router({ mergeParams: true }) // merge params from other router re-directions

const { protect, authorize } = require('../middleware/auth-middleware')

// courses routes
router.route('/')
    .get(advancedResults(ReviewModel, {
        path: commonValues.BOOTCAMP_REF_IN_COURSES,
        select: 'name description' // has to have spaces here
    }), getReviews)

module.exports = router