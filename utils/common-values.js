exports.BOOTCAMP_MODEL_NAME = 'Bootcamp'
exports.BOOTCAMP_REF_IN_COURSES = 'bootcamp'
exports.BOOTCAMP_ID_NAME = 'bootcampId'

exports.COURSE_MODEL_NAME = 'Course'
exports.COURSES_VIRTUAL_NAME = 'courses'

exports.USER_MODEL_NAME = 'User'

exports.PROD_ENV_NAME = 'production'
exports.DEV_ENV_NAME = 'development'

exports.responseBuilder = ({ response, returnStatus, isSuccess, returnData, returnCount, returnToken, returnCookie }) => {
    if (!response) {
        return
    }

    const returnJson = {
        success: isSuccess || false,
    }

    if (returnData) {
        returnJson[ 'data' ] = returnData
    }

    if (returnCount) {
        returnJson[ 'count' ] = returnCount
    }

    if (returnToken) {
        returnJson[ 'token' ] = returnToken
    }

    return response
        .status(returnStatus || 200)
        .json(returnJson)
}