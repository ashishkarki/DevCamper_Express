const ErrorResponse = require('../utils/errorResponse')

const errorHandler = (err, req, res, next) => {
    // let errorMain = { ...err }
    // console.log(`errorMain: ${ JSON.stringify(errorMain) }`)
    // console.log(`err: ${ JSON.stringify(err) }`)
    // console.log(`err.name: ${ err.name }`)

    // errorMain.message = err.message

    // log to console for the dev
    console.log(err.name.blue.bold)
    console.log(err.stack.red)

    // Mongoose bad ObjectId: CastError
    if (err.name === 'CastError') {
        const errMsg = `Resource not found with id of ${ err.value }`
        err = new ErrorResponse(errMsg, 404)
    }

    res.status(err.statusCode || 500).json({
        success: false,
        error: err.message || 'Server Error',
    })

}

module.exports = errorHandler