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
    res.status(200).json(res.advancedResults)

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
