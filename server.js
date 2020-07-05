const express = require('express')
const morgan = require('morgan')
const colors = require('colors')
const errorHandler = require('./middleware/error')

const dotenv = require('dotenv')
const connectDB = require('./config/db')

// load env vars 
dotenv.config({ path: './config/config.env' })

// connect to mongo db
connectDB()

// bring in route files
const bootcampsRouter = require('./routes/bootcamps-routes')
const coursesRouter = require('./routes/courses-routes')

const app = express()

// Body parser so content send in request is properly read
app.use(express.json())

// DEV logging middleware - only in dev environment
if (process.env.NODE_ENV === 'development') {
    app.use(morgan(`dev`))
}

// Mount routers
app.use('/api/v1/bootcamps', bootcampsRouter)
app.use('/api/v1/courses', coursesRouter)

// only now load the errorHandler
app.use(errorHandler)

const PORT = process.env.PORT || 5000

const server = app.listen(
    PORT,
    console.log(`Server running in ${ process.env.NODE_ENV } on port ${ PORT }`.blue.bold))

// handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${ err.message }.red`)

    // close server and exit process
    server.close(() => process.exit(1))
})
