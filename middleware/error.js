const ErrorResponse = require('../utils/errorResponse')

const errorHandler = (err, req, res, next) => {
    // let errorMain = { ...err }
    // console.log(`errorMain: ${ JSON.stringify(errorMain) }`)
    // console.log(`err: ${ JSON.stringify(err) }`)
    // console.log(`err.name: ${ err.name }`)

    // errorMain.message = err.message

    // log to console for the dev
    console.log(err)

    // Mongoose bad ObjectId: CastError
    if (err.name === 'CastError') {
        const errMsg = `Resource not found`
        err = new ErrorResponse(errMsg, 404)
    }

    // Mongoose duplicate key errro
    if (err.code === 11000) {
        const errMsg = `Duplicate field is not allowed`
        err = new ErrorResponse(errMsg, 400)
    }

    // Mongoose validation errors
    if (err.name === 'ValidationError') {
        const errMsg = Object.values(err.errors).map(val => ' ' + val.message)
        err = new ErrorResponse(errMsg, 400)
    }

    res.status(err.statusCode || 500).json({
        success: false,
        error: err.message || 'Server Error',
    })

}

module.exports = errorHandler