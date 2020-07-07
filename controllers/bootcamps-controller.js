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
    // add user to req.body
    req.body.user = req.user.id // assign the logged in user req.user

    // find the bootcamp that this user has published
    const findUserJson = {}
    findUserJson[ commonValues.USER_REF_IN_BOOTCAMP ] = req.user.id
    const publishedBootcamp = await BootcampModel.findOne(findUserJson)
    // if the user is not an admin, they can only add one bootcamp else they can add any many as they want
    if (publishedBootcamp && req.user.role !== commonValues.ROLE_NAMES.ADMIN) {
        return next(new ErrorResponse(`The user with ID ${ req.user.id } has already published a bootcamp`, 400))
    }

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
    let updatedBootcamp = await BootcampModel.findById(
        req.params.id,
    )

    if (!updatedBootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${ req.params.id }`, 404))
    }

    checkIfCorrectUser(updatedBootcamp, req)

    updatedBootcamp = await BootcampModel.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new: true,
            runValidators: true,
        })

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

    checkIfCorrectUser(deletedBootcamp, req)

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

    checkIfCorrectUser(bootcampToUploadPhoto, req)

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

checkIfCorrectUser = (bootcamp, req) => {
    // Make sure current user is the bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== commonValues.ROLE_NAMES.ADMIN) {
        return next(new ErrorResponse(`User with id ${ req.params.id } is not the owner or an admin and is not allowed to update this bootcamp`, 401))
    }
}
