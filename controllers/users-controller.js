const ErrorResponse = require('../utils/errorResponse')
const asynHandler = require('../middleware/async')
const UserModel = require('../models/User-model')
const advancedResults = require('../middleware/advancedResults')

const commonValues = require('../utils/common-values')

// @description  GET all users
// @route GET /api/v1/auth/users
// @access Private/Admin
exports.getUsers = asynHandler(async (req, res, next) => {
    commonValues.responseBuilder({
        response: res,
        returnStatus: 200,
        isSuccess: true,
        returnData: res.advancedResults
    })
})

// @description  GET single user
// @route GET /api/v1/auth/users/:id
// @access Private/Admin
exports.getUser = asynHandler(async (req, res, next) => {
    const user = await UserModel.findById((req.params.id))

    commonValues.responseBuilder({
        response: res,
        returnStatus: 200,
        isSuccess: true,
        returnData: user,
    })
})

// @description  CREATE new User
// @route POST /api/v1/auth/users
// @access Private/Admin
exports.createUser = asynHandler(async (req, res, next) => {
    const newUser = await UserModel.create((req.body))

    commonValues.responseBuilder({
        response: res,
        returnStatus: 201,
        isSuccess: true,
        returnData: newUser,
    })
})

// @description  UPDATE existing User
// @route PUT /api/v1/auth/users/:id
// @access Private/Admin
exports.updateUser = asynHandler(async (req, res, next) => {
    const updatedUser = await UserModel.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    })

    commonValues.responseBuilder({
        response: res,
        returnStatus: 200,
        isSuccess: true,
        returnData: updatedUser,
    })
})

// @description  DELETE existing User
// @route DELETE /api/v1/auth/users/:id
// @access Private/Admin
exports.deleteUser = asynHandler(async (req, res, next) => {
    const deletedUser = await UserModel.findByIdAndDelete(req.params.id)

    commonValues.responseBuilder({
        response: res,
        returnStatus: 200,
        isSuccess: true,
        returnData: deletedUser,
    })
})