const fs = require('fs')
const mongoose = require('mongoose')
const colors = require('colors')
const dotenv = require('dotenv')

// load env vars
dotenv.config({ path: './config/config.env' })

// load module
const Bootcamp_model = require('./models/Bootcamp-model')
const Course_model = require('./models/Course-model')

// connect to DB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
})

// read JSON files 
const bootcamps = JSON.parse(fs.readFileSync(`${ __dirname }/_data/bootcamps.json`, 'utf-8'))
const courses = JSON.parse(fs.readFileSync(`${ __dirname }/_data/courses.json`, 'utf-8'))

// import bootcamps above into DB
const importData = async () => {
    try {
        await Bootcamp_model.create(bootcamps)
        // await Course_model.create(courses)

        console.log(`Data imported...`.green.inverse)
        process.exit()
    } catch (error) {
        console.error(error)
    }
}

// Delete data
const deleteData = async () => {
    try {
        await Bootcamp_model.deleteMany() // delete everything
        await Course_model.deleteMany()

        console.log(`Data Deleted...`.red.inverse)
        process.exit()
    } catch (error) {
        console.error(error)
    }
}

if (process.argv[ 2 ] == '-i') {
    importData()
} else if (process.argv[ 2 ] === '-d') {
    deleteData()
}