const express = require('express')
const morgan = require('morgan')
const colors = require('colors')
const fileUpload = require('express-fileupload')
const cookieParser = require('cookie-parser')
const path = require('path')
const errorHandler = require('./middleware/error')
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')
const xss = require('xss-clean')
const rateLimit = require('express-rate-limit')
const hpp = require('hpp')
const cors = require('cors')

const dotenv = require('dotenv')
const connectDB = require('./config/db')

// load env vars 
dotenv.config({ path: './config/config.env' })

// connect to mongo db
connectDB()

// bring in route files
const bootcampsRouter = require('./routes/bootcamps-routes')
const coursesRouter = require('./routes/courses-routes')
const authRouter = require('./routes/auth-routes')
const usersRouter = require('./routes/users-routes')
const reviewsRouter = require('./routes/reviews-routes')

const app = express()

// Body parser so content send in request is properly read
app.use(express.json())

// Cookie parser middleware
app.use(cookieParser())

// DEV logging middleware - only in dev environment
if (process.env.NODE_ENV === 'development') {
    app.use(morgan(`dev`))
}

// File uploading
app.use(fileUpload())

// sanitize our data like URLs, param etc
app.use(mongoSanitize())

// more sanitizing of parms, urls i.e prevents XSS attacks
app.use(xss())

// rate limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 mins
    max: 100,
})
app.use(limiter)

// prevent http param pollution
app.use(hpp())

// Enable CORS
app.use(cors())

// set static folders
app.use(express.static(path.join(__dirname, 'public')))

// add helmet to add safety headers
app.use(helmet())

// Mount routers
app.use('/api/v1/bootcamps', bootcampsRouter)
app.use('/api/v1/courses', coursesRouter)
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/users', usersRouter)
app.use('/api/v1/reviews', reviewsRouter)

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
