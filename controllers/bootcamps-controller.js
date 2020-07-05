const ErrorResponse = require('../utils/errorResponse')
const geocoder = require('../utils/geocoder')
const BootcampModel = require('../models/Bootcamp-model')
const asynHandler = require('../middleware/async')
const path = require('path')

const commonValues = require('../utils/common-values')

// @description  Get all bootcamps
// @route GET /api/v1/bootcamps
// @access Public
exports.getBootcamps = asynHandler(async (req, res, next) => {
    // copy req.query
    const reqQuery = { ...req.query }

    // fieldsd to exclude from mongo's filtering
    const removeFields = [ 'select', 'sort', 'page', 'limit' ]

    // loop over removeFeilds and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[ param ])

    let queryStr = JSON.stringify(reqQuery).replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${ match }`)

    // build the main-query to be executed
    let mainQuery = BootcampModel.find(JSON.parse(queryStr)).populate(commonValues.COURSES_VIRTUAL_NAME)

    // "select" fields
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ')
        mainQuery = mainQuery.select(fields)
    }

    // "sort" fieldds
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ')
        mainQuery = mainQuery.sort(sortBy)
    } else {
        mainQuery = mainQuery.sort('-createdAt') // minus means descending createdAt
    }

    // pagination
    const page = parseInt(req.query.page, 10) || 1 // 10 base
    const limit = parseInt(req.query.limit, 10) || 25
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const total = await BootcampModel.countDocuments()

    mainQuery = mainQuery.skip(startIndex).limit(limit)

    const allBootcamps = await mainQuery

    // paginamtion resuklt
    const pagination = {}

    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit: limit
        }
    }
    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        }
    }

    res.status(200).json({
        success: true,
        count: allBootcamps.length,
        pagination: pagination,
        data: allBootcamps,
    })

})

// @description  Get a single bootcamp
// @route GET /api/v1/bootcamps/:id
// @access Public
exports.getBootcamp = asynHandler(async (req, res, next) => {
    const oneBootcamp = await BootcampModel.findById(req.params.id)

    if (!oneBootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${ req.params.id }`, 404))
    }

    res.status(200).json({
        success: true,
        data: oneBootcamp,
    })
})

// @description  Create a new bootcamp
// @route POST /api/v1/bootcamps
// @access Private
exports.createBootcamp = asynHandler(async (req, res, next) => {
    const newBootcamp = await BootcampModel.create(req.body)

    res.status(201).json({
        success: true,
        data: newBootcamp,
    })
})

// @description  Update an existing bootcamp
// @route PUT /api/v1/bootcamps/:id
// @access Private
exports.updateBootcamp = asynHandler(async (req, res, next) => {
    const updatedBootcamp = await BootcampModel.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new: true,
            runValidators: true,
        }
    )

    if (!updatedBootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${ req.params.id }`, 404))
    }

    res.status(200).json({
        success: true,
        data: updatedBootcamp,
    })
})

// @description  Delete an existing bootcamp
// @route DELETE /api/v1/bootcamps/:id
// @access Private
exports.deleteBootcamp = asynHandler(async (req, res, next) => {
    const deletedBootcamp = await BootcampModel.findById(req.params.id)

    if (!deletedBootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${ req.params.id }`, 404))
    }

    // using .remove() causes the "remove" pre to trigger in Bootcamp-model
    deletedBootcamp.remove()

    res.status(200).json({
        success: true,
        data: deletedBootcamp,
    })
})

// @description  Get bootcamps within a radius
// @route DELETE /api/v1/bootcamps/radius/:zipcode/:distance
// @access Private
exports.getBootcampsInRadius = asynHandler(async (req, res, next) => {
    const { zipcode, distance } = req.params

    // Get lat/lng from geocoder
    const loc = await geocoder.geocode(zipcode)
    const lat = loc[ 0 ].latitude
    const lng = loc[ 0 ].longitude

    // Calc radius using radians
    // Divide dist by radius of Earth
    // Earth Radius = 3,963 mi / 6,378 km
    const radius = distance / 3963
    console.log(`lat: ${ lat }, lng: ${ lng }, radius: ${ radius }`)
    const bootcamps = await BootcampModel.find({
        location: { $geoWithin: { $centerSphere: [ [ lng, lat ], radius ] } }
    })

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps
    })
})

// @description  Upload photo for bootcamp
// @route PUT /api/v1/bootcamps/:id/photo
// @access Private
exports.bootcampPhotoUpload = asynHandler(async (req, res, next) => {
    const bootcampToUploadPhoto = await BootcampModel.findById((req.params.id))

    if (!bootcampToUploadPhoto) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${ req.params.id }`, 404))
    }

    if (!req.files) {
        return next(new ErrorResponse('Please upload a file', 400))
    }

    const toBeUploadedFile = req.files.file

    // make sure the image is a photo
    if (!toBeUploadedFile.mimetype.startsWith('image')) {
        return next(new ErrorResponse(`Please upload an image file`, 400))
    }

    //check file size
    if (toBeUploadedFile.size > process.env.MAX_FILE_UPLOAD) {
        return next(new ErrorResponse(`Please upload an image less than ${ process.env.MAX_FILE_UPLOAD } in size`, 400))
    }

    // Create custom filename so there is no overwriting
    toBeUploadedFile.name = `photo_${ bootcampToUploadPhoto._id }${ path.parse(toBeUploadedFile.name).ext }`

    // upload the file now
    toBeUploadedFile.mv(`${ process.env.FILE_UPLOAD_PATH }/${ toBeUploadedFile.name }`, async err => {
        if (err) {
            console.error(err)
            return next(
                new ErrorResponse(`Problem with file upload`, 500)
            )
        }

        await BootcampModel.findByIdAndUpdate(req.params.id, { photo: toBeUploadedFile.name })

        res.status(200).json({
            success: true,
            data: toBeUploadedFile.name
        })
    })
})
