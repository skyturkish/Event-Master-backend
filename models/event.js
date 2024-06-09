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
  required: [true, 'Discord ID is required!']
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
      required: [true, 'Participant status is required!'],
      default: 'invited'
    }
  },
  { _id: false }
)

// Enum for event status
const eventStatusEnum = {
  values: ['not-started', 'ready-to-start', 'ongoing', 'finished', 'canceled'],
  message: 'Status must be one of not-started, ready-to-start, ongoing, finished, canceled'
}

// Event schema
const EventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required!'],
      minlength: [4, 'Title must be at least 4 characters long!'],
      maxlength: [100, 'Title must be less than 101 characters long!']
    },
    description: {
      type: String,
      minlength: [4, 'Description must be at least 4 characters long!'],
      maxlength: [512, 'Description must be less than 513 characters long!']
    },
    creator: discordIDSchema,
    guild: discordIDSchema,
    participants: [participantSchema],
    participantLimit: {
      type: Number,
      required: [true, 'Participant limit is required!'],
      min: [1, 'Participant limit must be at least 1!']
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required!']
    },
    status: {
      type: String,
      enum: eventStatusEnum,
      required: [true, 'Event status is required!'],
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
