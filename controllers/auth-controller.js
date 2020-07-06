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

    // Create a token - call this "method" on the object of UserModel which is "user" from above
    const signedToken = user.getSignedJwtToken()

    commonValues.responseBuilder({ response: res, returnStatus: 200, isSuccess: true, returnToken: signedToken })
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

    // Create a token - call this "method" on the object of UserModel which is "user" from above
    const signedToken = user.getSignedJwtToken()

    commonValues.responseBuilder({ response: res, returnStatus: 200, isSuccess: true, returnToken: signedToken })
})