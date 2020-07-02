
// @description  Get all bootcamps
// @route GET /api/v1/bootcamps
// @access Public
exports.getBootcamps = (req, res, next) => {
    res.status(200).json({ success: true, message: 'Show all bootcamps' })
}

// @description  Get a single bootcamp
// @route GET /api/v1/bootcamps/:id
// @access Public
exports.getBootcamp = (req, res, next) => {
    res.status(200).json({ success: true, message: `Show one bootcamp with id: ${ req.params.id }` })
}

// @description  Create a new bootcamp
// @route POST /api/v1/bootcamps
// @access Private
exports.createBootcamp = (req, res, next) => {
    res.status(201).json({ success: true, message: 'Create a new bootcamp' })
}

// @description  Update an existing bootcamp
// @route PUT /api/v1/bootcamps/:id
// @access Private
exports.updateBootcamp = (req, res, next) => {
    res.status(200).json({ success: true, message: `Update bootcamp with id: ${ req.params.id }` })
}

// @description  Delete an existing bootcamp
// @route DELETE /api/v1/bootcamps/:id
// @access Private
exports.deleteBootcamp = (req, res, next) => {
    res.status(200).json({ success: true, message: `DELETE bootcamp with id: ${ req.params.id }` })
}