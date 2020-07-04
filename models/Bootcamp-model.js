const mongoose = require('mongoose')
const slugify = require('slugify')

const geocoder = require('../utils/geocoder')

const BootcampSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [ true, 'Please add a name' ],
        unique: true,
        trim: true,
        maxlength: [ 50, 'Name cannot be more than 50 characters' ]
    },
    slug: String,
    description: {
        type: String,
        required: [ true, 'Please add a description' ],
        maxlength: [ 500, 'Description cannot be more than 500 characters' ]
    },
    website: {
        type: String,
        match: [
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
            'Please enter a valid URL with Http or Https'
        ]
    },
    phone: {
        type: String,
        maxlength: [ 20, 'Phone number cannot be longer than 20 characters' ]
    },
    email: {
        type: String,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            , 'Please enter a valid email ID' ]
    },
    address: {
        type: String,
        required: [ true, 'Please add an address' ]
    },
    location: {
        // GeoJson Point
        type: {
            type: String,
            enum: [ 'Point' ],
            //required: true,
        },
        coordindates: {
            type: [ Number ],
            //required: true,
            index: '2dsphere',
        },
        formattedAddress: String,
        street: String,
        city: String,
        state: String,
        zipcode: String,
        country: String,
    },
    careers: {
        type: [ String ],
        required: true,
        enum: [
            'Web Development',
            'Mobile Development',
            'UI/UX',
            'Data Science',
            'Business',
            'Other',
        ]
    },
    averageRating: {
        type: Number,
        min: [ 1, 'Rating must be at least 1' ],
        max: [ 10, 'Rating cannot be more than 10' ],
    },
    averageCost: Number,
    photo: {
        type: String,
        default: 'no-photo.jpg',
    },
    housing: {
        type: Boolean,
        default: false,
    },
    jobAssitance: {
        type: Boolean,
        default: false,
    },
    jobGuarantee: {
        type: Boolean,
        default: false,
    },
    acceptGi: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
})

// Create bootcamp slug from the name
BootcampSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true })
    next()
})

// geocode and create location field
BootcampSchema.pre('save', async function (next) {
    const tempLocation = await geocoder.geocode(this.address)
    this.location = {
        type: 'Point',
        coordindates: [
            tempLocation[ 0 ].longitude,
            tempLocation[ 0 ].latitude
        ],
        formattedAddress: tempLocation[ 0 ].formattedAddress,
        street: tempLocation[ 0 ].streetName,
        city: tempLocation[ 0 ].city,
        state: tempLocation[ 0 ].stateCode,
        zipcode: tempLocation[ 0 ].zipcode,
        country: tempLocation[ 0 ].countryCode
    }

    // do not ssave address in the DB
    this.address = undefined

    next()
})


module.exports = mongoose.model('Bootcamp', BootcampSchema)