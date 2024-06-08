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

// Enum for participant status
const participantStatusEnum = {
  values: ['accepted', 'declined', 'maybe', 'invited'],
  message: 'Status must be one of accepted, declined, maybe, invited'
}

// Schema for participant
const participantSchema = new mongoose.Schema(
  {
    discordID: discordIDSchema,
    status: {
      type: String,
      enum: participantStatusEnum,
      required: true,
      default: 'invited'
    }
  },
  { _id: false }
)

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
  const currentParticipants = this.participants.filter((p) => p.status !== 'invited').length
  return currentParticipants < this.participantLimit
}

module.exports = mongoose.model('Event', EventSchema)