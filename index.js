const express = require('express')
const indexRouter = require('./routes/index')
const eventRouter = require('./routes/event')
const bodyParser = require('body-parser')

require('./routes/mongo-connection')

require('./cron-jobs')

const app = express()

app.use(bodyParser.json())

app.use((err, req, res, next) => {
  console.error(err.stack)
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message })
  }
  res.status(500).json({ error: 'somethingWentWrong' })
})

app.use('/event', eventRouter)
app.use('/', indexRouter)

app.get('/health', (req, res) => {
  res.send(new Date().toISOString())
})

module.exports = app
