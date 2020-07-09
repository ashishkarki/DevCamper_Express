const express = require('express')

const {
    register,
    login,
    getMe,
    logout,
    forgotPassword,
    resetPassword,
    updateDetails,
    updatePassword,
} = require('../controllers/auth-controller')

const { protect } = require('../middleware/auth-middleware')

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.post('/forgotpassword', forgotPassword)

router.get('/me', protect, getMe)
router.get('/logout', protect, logout)

router.put('/resetpassword/:resettoken', resetPassword)
router.put('/updatedetails', protect, updateDetails)
router.put('/updatepassword', protect, updatePassword)

module.exports = router