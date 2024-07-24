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

// Enum for user status
const userStatusEnum = {
  values: ['attending', 'declined', 'considering', 'invited', 'waitlist'],
  message: 'Status must be one of attending, declined, considering, invited, waitlist'
}

// Schema for user
const userSchema = new mongoose.Schema(
  {
    discordID: discordIDSchema,
    status: {
      type: String,
      enum: userStatusEnum,
      required: [true, 'User status is required!'],
      default: 'invited'
    }
  },
  { _id: false, timestamps: true }
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
    users: [userSchema],
    participantLimit: {
      type: Number,
      required: [true, 'Participant limit is required!'],
      min: [1, 'Participant limit must be at least 1!'],
      max: [1024, 'Participant limit must be less than 1025!']
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


module.exports = mongoose.model('Event', EventSchema)
