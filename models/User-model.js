const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const commonValues = require('../utils/common-values')

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [ true, 'Please add a user name' ]
    },
    email: {
        type: String,
        required: [ true, 'Please add an email' ],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            , 'Please enter a valid email ID' ]
    },
    role: {
        type: String,
        enum: [ 'user', commonValues.ROLE_NAMES.PUBLISHER ],
        default: 'user',
    },
    password: {
        type: String,
        required: [ true, 'Please enter a password' ],
        minlength: 6,
        select: false, // don't return or show password when querying
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now,
    }
})

// Encrypt password using bcryptjs
UserSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
    const payload = {
        id: this._id,
    }
    const secret = process.env.JWT_SECRET
    const options = {
        expiresIn: process.env.JWT_EXPIRE
    }

    return jwt.sign(payload, secret, options)
}

// Match user-entered, plain password to hashed password in DB
UserSchema.methods.matchPasswords = async function (userEnteredPlainPw) {
    // here this.password is the encrypted password stored by UserModel in the DB.
    return await bcrypt.compare(userEnteredPlainPw, this.password)
}

// export the model
module.exports = mongoose.model(
    commonValues.USER_MODEL_NAME,
    UserSchema
)