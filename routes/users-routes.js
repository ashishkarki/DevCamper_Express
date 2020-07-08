const express = require('express')

const commonValue = require('../utils/common-values')

const {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
} = require('../controllers/users-controller')

const UserModel = require('../models/User-model')

const router = express.Router({ mergeParams: true })

const advancedResults = require('../middleware/advancedResults')
const { protect, authorize } = require('../middleware/auth-middleware')

// every route will use the protect and the authorize middlewares
router.use(protect)
router.use(authorize(commonValue.ROLE_NAMES.ADMIN))

router.route('/')
    .get(advancedResults(UserModel), getUsers)
    .post(createUser)

router.route('/:id')
    .get(getUser)
    .put(updateUser)
    .delete(deleteUser)

module.exports = router