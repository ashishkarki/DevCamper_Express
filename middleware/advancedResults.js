const advancedResults = (model, populateClause) => async (req, res, next) => {
    const reqQuery = { ...req.query }

    // fieldsd to exclude from mongo's filtering
    const removeFields = [ 'select', 'sort', 'page', 'limit' ]

    // loop over removeFeilds and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[ param ])

    let queryStr = JSON.stringify(reqQuery).replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${ match }`)

    // build the main-query to be executed
    let mainQuery = model.find(JSON.parse(queryStr))
    //.populate(commonValues.COURSES_VIRTUAL_NAME)

    // "select" fields
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ')
        mainQuery = mainQuery.select(fields)
    }

    // "sort" fieldds
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ')
        mainQuery = mainQuery.sort(sortBy)
    } else {
        mainQuery = mainQuery.sort('-createdAt') // minus means descending createdAt
    }

    // pagination
    const page = parseInt(req.query.page, 10) || 1 // 10 base
    const limit = parseInt(req.query.limit, 10) || 25
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const total = await model.countDocuments()

    mainQuery = mainQuery.skip(startIndex).limit(limit)

    // add the populate from the argument
    if (populateClause) {
        mainQuery = mainQuery.populate(populateClause)
    }

    const results = await mainQuery

    // paginamtion resuklt
    const pagination = {}

    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit: limit
        }
    }
    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        }
    }

    res.advancedResults = {
        success: true,
        count: results.length,
        pagination,
        data: results,
    }

    next()
}

module.exports = advancedResults