const ErrorResponse = require('../utils/errorResponse')
const asynHandler = require('../middleware/async')
const UserModel = require('../models/User-model')

const commonValues = require('../utils/common-values')

// @description  Register user
// @route GET /api/v1/auth/register
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

    commonValues.responseBuilder(res, 200, true)
})