const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  bot: {
    type: Boolean,
  },
  system: {
    type: Boolean,
  },
  flags: {
    type: Number,
  },
  username: {
    type: String,
    required: true,
  },
  globalName: {
    type: String,
  },
  discriminator: {
    type: String,
  },
  avatar: {
    type: String,
  },
  banner: {
    type: String,
  },
  accentColor: {
    type: String,
  },
  avatarDecoration: {
    type: String,
  },
})

UserSchema.plugin(require('mongoose-autopopulate'))

UserSchema.methods.getFullTag = function () {
  return `${this.username}#${this.discriminator}`
}

module.exports = mongoose.model('User', UserSchema)
