const ErrorResponse = require('../utils/errorResponse')
const asynHandler = require('../middleware/async')
const UserModel = require('../models/User-model')

const commonValues = require('../utils/common-values')
const { response } = require('express')

// @description  Register user
// @route POST /api/v1/auth/register
// @access Public
exports.register = asynHandler(async (req, res, next) => {
    const { name, email, password, role } = req.body

    // create user
    const user = await UserModel.create({
        name,
        email,
        password,
        role,
    })

    sendTokenResponse(user, 200, res)
})

// @description  Login user
// @route POST /api/v1/auth/login
// @access Public
exports.login = asynHandler(async (req, res, next) => {
    const { email, password } = req.body

    // Validate email and password
    if (!email || !password) {
        return next(new ErrorResponse(`Please provide an email and password`, 400))
    }

    // check for user
    const user = await UserModel.findOne({ email: email }).select(('+password')) // since select is false in UserModel for password
    if (!user) {
        return next(new ErrorResponse(`Invalid Credentials`, 401))
    }

    // check if password matches
    const isMatch = await user.matchPasswords(password)

    if (!isMatch) {
        return next(new ErrorResponse(`Invalid Credentials`, 401))
    }

    sendTokenResponse(user, 200, res)
})

// Get token from model and also create a cookie and send the response
const sendTokenResponse = (user, statusCode, response) => {
    // Create a token - call this "method" on the object of UserModel which is "user" from above
    const signedToken = user.getSignedJwtToken()

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true, // only allow cookie to be accessed via client side script
        // When HttpOnly flag is used, JavaScript will not be able to read the cookie in case of XSS exploitation
    }

    if (process.env.NODE_ENV === commonValues.PROD_ENV_NAME) {
        //  When a secure flag is used, then the cookie will only be sent over HTTPS, which is HTTP over SSL/TLS
        options.secure = true
    }

    response
        .status(statusCode)
        .cookie('token', signedToken, options)
        .json({
            success: true,
            token: signedToken
        })
}

// @description  Get currently logged in user
// @route POST /api/v1/auth/me
// @access Private
exports.getMe = asynHandler(async (req, res, next) => {
    const currentUserObj = await UserModel.findById(req.user.id)

    commonValues.responseBuilder({
        response: res,
        isSuccess: true,
        returnData: currentUserObj
    })
})