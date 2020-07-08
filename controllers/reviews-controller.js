const ErrorResponse = require('../utils/errorResponse')
const asynHandler = require('../middleware/async')

const ReviewModel = require('../models/Review-model')
const BootcampModel = require('../models/Bootcamp-model')

const commonValues = require('../utils/common-values')

// @description  Get all revieews
// @route GET /api/v1/reviewes
// @route GET /api/v1/bootcamps/:bootcampId/reviews
// @access Public
exports.getReviews = asynHandler(async (req, res, next) => {
    if (req.params.bootcampId) {
        const findObj = {}
        findObj[ commonValues.BOOTCAMP_REF_IN_COURSES ] = req.params.bootcampId

        const reviews = await ReviewModel.find(findObj)

        commonValues.responseBuilder({
            response: res,
            returnStatus: 200,
            isSuccess: true,
            returnCount: reviews.length,
            returnData: reviews,
        })
    } else {
        res.status(200).json(res.advancedResults)
    }
})