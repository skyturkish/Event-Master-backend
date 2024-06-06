const mongoose = require('mongoose')

// Custom type definition for Discord ID
const discordIDSchema = {
  type: String,
  validate: {
    validator: function (v) {
      return /^\d+$/.test(v) // Discord ID consists of digits only
    },
    message: (props) => `${props.value} is not a valid Discord ID!`
  },
  required: true
}

// Schema for participant lists
const participantSchema = {
  ...discordIDSchema,
  default: []
}

// Event schema
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
    creator: discordIDSchema,
    guild: discordIDSchema,
    participants: [participantSchema],
    declinedParticipants: [participantSchema],
    maybeParticipants: [participantSchema],
    invitedParticipants: [participantSchema],
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

EventSchema.methods.canAddParticipant = function () {
  return this.participants.length < this.participantLimit
}

module.exports = mongoose.model('Event', EventSchema)
