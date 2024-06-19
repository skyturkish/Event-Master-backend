const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URL || 'mongodb://0.0.0.0:27017/event-master')

var db = mongoose.connection

db.on('error', console.error.bind(console, 'connection error'))

db.once('open', function () {
  console.log('we are connected to mongodb!')
})
