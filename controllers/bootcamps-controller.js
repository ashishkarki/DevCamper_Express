const ErrorResponse = require('../utils/errorResponse')
const geocoder = require('../utils/geocoder')
const BootcampModel = require('../models/Bootcamp-model')
const asynHandler = require('../middleware/async')

// @description  Get all bootcamps
// @route GET /api/v1/bootcamps
// @access Public
exports.getBootcamps = asynHandler(async (req, res, next) => {
    const allBootcamps = await BootcampModel.find()

    res.status(200).json({
        success: true,
        count: allBootcamps.length,
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
    const deletedBootcamp = await BootcampModel.findByIdAndDelete(req.params.id)

    if (!deletedBootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${ req.params.id }`, 404))
    }

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
