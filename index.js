const express = require('express')
const indexRouter = require('./routes/index')
const eventRouter = require('./routes/event')

const bodyParser = require('body-parser')

require('./routes/mongo-connection')

const app = express()

app.use(bodyParser.json())

app.use('/event', eventRouter)
app.use('/', indexRouter)

app.get('/health', (req, res) => {
  res.send(new Date().toISOString())
})

module.exports = app
