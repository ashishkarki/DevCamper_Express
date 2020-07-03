const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')

// bring in route files
const bootcamps = require('./routes/bootcamps-routes')

// load env vars 
dotenv.config({ path: './config/config.env' })

const app = express()

// DEV logging middleware - only in dev environment
if (process.env.NODE_ENV === 'development') {
    app.use(morgan(`dev`))
}

// Mount routers
app.use('/api/v1/bootcamps', bootcamps)

const PORT = process.env.PORT || 5000

app.listen(
    PORT,
    console.log(`Server running in ${ process.env.NODE_ENV } on port ${ PORT }`))
