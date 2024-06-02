const express = require('express')
const userRouter = require('./routes/user')
const indexRouter = require('./routes/index')

const bodyParser = require('body-parser')

require('./routes/mongo-connection')

const app = express()

app.use(bodyParser.json())

app.use('/user', userRouter)
app.use('/', indexRouter)

module.exports = app
