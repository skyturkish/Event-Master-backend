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
  values: ['attending', 'declined', 'considering', 'invited'],
  message: 'Status must be one of attending, declined, considering, invited'
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

// Enum for event status
const eventStatusEnum = {
  values: ['not-started', 'ongoing', 'finished', 'canceled'],
  message: 'Status must be one of not-started, ongoing, finished, canceled'
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
    participantLimit: {
      type: Number,
      required: true
    },
    startTime: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: eventStatusEnum,
      required: true,
      default: 'not-started'
    }
  },
  { timestamps: true }
)

EventSchema.methods.canAddParticipant = function () {
  const currentParticipants = this.participants.filter((p) => p.status !== 'invited').length
  return currentParticipants < this.participantLimit
}

module.exports = mongoose.model('Event', EventSchema)
