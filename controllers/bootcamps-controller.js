const ErrorResponse = require('../utils/errorResponse')
const BootcampModel = require('../models/Bootcamp-model')

// @description  Get all bootcamps
// @route GET /api/v1/bootcamps
// @access Public
exports.getBootcamps = async (req, res, next) => {
    try {
        const allBootcamps = await BootcampModel.find()

        res.status(200).json({
            success: true,
            count: allBootcamps.length,
            data: allBootcamps,
        })
    } catch (error) {
        next(error)
    }
}

// @description  Get a single bootcamp
// @route GET /api/v1/bootcamps/:id
// @access Public
exports.getBootcamp = async (req, res, next) => {
    try {
        const oneBootcamp = await BootcampModel.findById(req.params.id)

        if (!oneBootcamp) {
            return next(new ErrorResponse(`Bootcamp not found with id of ${ req.params.id }`, 404))
        }

        res.status(200).json({
            success: true,
            data: oneBootcamp,
        })
    } catch (error) {
        //next(new ErrorResponse(`Bootcamp not found with id of ${ req.params.id }`, 404))
        next(error)
    }
}

// @description  Create a new bootcamp
// @route POST /api/v1/bootcamps
// @access Private
exports.createBootcamp = async (req, res, next) => {
    try {
        const newBootcamp = await BootcampModel.create(req.body)

        res.status(201).json({
            success: true,
            data: newBootcamp,
        })
    } catch (error) {
        next(error)
    }
}

// @description  Update an existing bootcamp
// @route PUT /api/v1/bootcamps/:id
// @access Private
exports.updateBootcamp = async (req, res, next) => {
    try {
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
    } catch (error) {
        next(error)
    }
}

// @description  Delete an existing bootcamp
// @route DELETE /api/v1/bootcamps/:id
// @access Private
exports.deleteBootcamp = async (req, res, next) => {
    try {
        const deletedBootcamp = await BootcampModel.findByIdAndDelete(req.params.id)

        if (!deletedBootcamp) {
            return next(new ErrorResponse(`Bootcamp not found with id of ${ req.params.id }`, 404))
        }

        res.status(200).json({
            success: true,
            data: deletedBootcamp,
        })
    } catch (error) {
        next(error)
    }
}
