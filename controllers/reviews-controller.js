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
        findObj[ commonValues.BOOTCAMP_REF_ELSEWHERE ] = req.params.bootcampId

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

// @description  Get a single revieew
// @route GET /api/v1/reviewes/:id
// @access Public
exports.getReview = asynHandler(async (req, res, next) => {
    const review = await ReviewModel.findById(req.params.id).populate({
        path: commonValues.BOOTCAMP_REF_ELSEWHERE,
        select: 'name description'
    })

    if (!review) {
        return next(new ErrorResponse(`No review found with id of ${ req.params.id }`, 404))
    }

    commonValues.responseBuilder({
        response: res,
        returnStatus: 200,
        isSuccess: true,
        returnData: review,
    })
})

// @description  Add a reivew
// @route POST /api/v1/bootcamps/:bootcampId/reviews
// @access Private
exports.addReview = asynHandler(async (req, res, next) => {
    req.body[ commonValues.BOOTCAMP_REF_ELSEWHERE ] = req.params[ commonValues.BOOTCAMP_ID_NAME ]
    req.body[ commonValues.USER_REF_ELSEWHERE ] = req.user.id

    const bootcampToAddReview = await BootcampModel.findById(req.params[ commonValues.BOOTCAMP_ID_NAME ])

    if (!bootcampToAddReview) {
        return next(ErrorResponse(`No bootcamp with id of ${ req.params[ commonValues.BOOTCAMP_ID_NAME ] }`))
    }

    const reviewToAdd = await ReviewModel.create(req.body)

    res.status(201).json({
        success: true,
        data: reviewToAdd,
    })
})