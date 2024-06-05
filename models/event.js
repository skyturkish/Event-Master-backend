const mongoose = require('mongoose')

const EventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      minlength: 4,
      maxlength: 64
    },
    description: {
      type: String,
      minlength: 4,
      maxlength: 512
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      autopopulate: true,
      required: true
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        autopopulate: true,
        default: []
      }
    ],
    declinedParticipants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        autopopulate: true,
        default: []
      }
    ],
    maybeParticipants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        autopopulate: true,
        default: []
      }
    ],
    invitedParticipants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        autopopulate: true,
        default: []
      }
    ],
    participantLimit: {
      type: Number,
      required: true
    },
    startTime: {
      type: Date,
      required: true
    }
  },
  { timestamps: true }
)

EventSchema.plugin(require('mongoose-autopopulate'))

EventSchema.methods.canAddParticipant = function () {
  return this.participants.length < this.participantLimit
}

module.exports = mongoose.model('Event', EventSchema)
