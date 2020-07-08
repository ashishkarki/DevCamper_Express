const jwt = require('jsonwebtoken')
const asyncHandler = require('./async')
const ErrorResponse = require('../utils/errorResponse')
const UserModel = require('../models/User-model')

// protect routes
exports.protect = asyncHandler(async (req, res, next) => {
    let token

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[ 1 ]
    }

    // else if (req.cookies.token) {
    //     token = req.cookies.token
    // }

    // Make sure that the token in auth..header exists
    if (!token) {
        return next(new ErrorResponse(`Not Authorized to access this resource`, 401))
    }

    try {
        // verify the token is correct user
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
        // console.log(decodedToken)

        req.user = await UserModel.findById(decodedToken.id)

        next()
    } catch (error) {
        return next(new ErrorResponse(`Not Authorized to access this resource`, 401))
    }
})

// Grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ErrorResponse(`User role '${ req.user.role }' is not authorized to access this route`, 403))
        }
        next()
    }
}
