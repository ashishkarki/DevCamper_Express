const crypto = require('crypto')

const ErrorResponse = require('../utils/errorResponse')
const asynHandler = require('../middleware/async')
const UserModel = require('../models/User-model')

const commonValues = require('../utils/common-values')
const { response } = require('express')
const sendEmail = require('../utils/send-email')

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

// @description  Forgot password
// @route POST /api/v1/auth/forgotpassword
// @access Public
exports.forgotPassword = asynHandler(async (req, res, next) => {
    const currentUserObj = await UserModel.findOne({ email: req.body.email })

    if (!currentUserObj) {
        return next(new ErrorResponse(`There is no user with that email ID`, 404))
    }

    // get reset token
    const resetToken = await currentUserObj.getResetPasswordToken()

    await currentUserObj.save({ validateBeforeSave: false })

    // Create reset url
    const resetUrl = `${ req.protocol }://${ req.get('host') }/api/v1/auth/resetpassword/${ resetToken }`

    const message = `You are receiving this email because your or someone else has requested the reset of a password. Please make a PUT request to: \n\n ${ resetUrl }`

    try {
        await sendEmail({
            email: currentUserObj.email,
            subject: 'Password reset token',
            message
        })

        res
            .status(200)
            .json({
                success: true,
                data: 'Email sent'
            })
    } catch (error) {
        currentUserObj.resetPasswordToken = undefined
        currentUserObj.resetPasswordExpire = undefined

        await currentUserObj.save(({ validateBeforeSave: false }))

        return next(new ErrorResponse('Reset email could not be sent', 500))
    }

    commonValues.responseBuilder({
        response: res,
        isSuccess: true,
        returnData: currentUserObj
    })
})

// @description  Reset the password
// @route PUT /api/v1/auth/resetpassword/:resettoken
// @access Public
exports.resetPassword = asynHandler(async (req, res, next) => {
    // get hashed token
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resettoken)
        .digest('hex')

    const currentUserObj = await UserModel.findOne({
        resetPasswordToken: resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    })

    if (!currentUserObj) {
        return next(new ErrorResponse('Invalid token', 400))
    }

    // if token is good, set the new password
    currentUserObj.password = req.body.password

    // clear out the reset.. fields and save the user obj. to DB
    currentUserObj.resetPasswordToken = undefined
    currentUserObj.resetPasswordExpire = undefined
    await currentUserObj.save()

    sendTokenResponse(currentUserObj, 200, res)
})

// @description  Update user details
// @route PUT /api/v1/auth/updatedetails
// @access Private
exports.updateDetails = asynHandler(async (req, res, next) => {
    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email
    }

    const currentUserObj = await UserModel.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true,
    })

    commonValues.responseBuilder({
        response: res,
        returnStatus: 200,
        isSuccess: true,
        returnData: currentUserObj
    })
})

// @description  Update Password
// @route PUT /api/v1/auth/updatepassword
// @access Private
exports.updatePassword = asynHandler(async (req, res, next) => {
    const currentUserObj = await UserModel.findById(req.user.id).select('+password')

    // check that current password is correct
    if (!(await currentUserObj.matchPasswords(req.body.currentPassword))) {
        return next(new ErrorResponse('Current Password is incorrect', 401))
    }

    currentUserObj.password = req.body.newPassword
    await currentUserObj.save()

    sendTokenResponse(currentUserObj, 200, res)
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