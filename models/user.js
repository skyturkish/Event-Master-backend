const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
})

UserSchema.plugin(require('mongoose-autopopulate'))

module.exports = mongoose.model('User', UserSchema)
