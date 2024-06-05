const express = require('express')
const indexRouter = require('./routes/index')
const eventRouter = require('./routes/event')

const bodyParser = require('body-parser')

require('./routes/mongo-connection')

const app = express()

app.use(bodyParser.json())

app.use('/event', eventRouter)
app.use('/', indexRouter)

module.exports = app
