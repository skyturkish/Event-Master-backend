const moment = require('moment')
const eventService = require('../services/event-service')

const validateParticipantLimit = (req, res, next) => {
  const { participantLimit } = req.body

  if (participantLimit === undefined) return next()

  if (isNaN(participantLimit) || participantLimit < 0 || participantLimit > 1000) {
    return res.status(400).send({ error: 'Participant limit must be a number between 0 and 1000.' })
  }
  next()
}

const validateStartTime = (req, res, next) => {
  const { startTime } = req.body
  const eventTime = moment(startTime)
  if (!eventTime.isValid()) {
    return res.status(400).send({ error: 'Invalid start time format.' })
  }
  const now = moment()
  if (eventTime.isBefore(now)) {
    return res.status(400).send({ error: 'You cannot create an event in the past.' })
  }
  const maxAdvanceTime = moment().add(45, 'days')
  if (eventTime.isAfter(maxAdvanceTime)) {
    return res.status(400).send({ error: 'You cannot create an event more than 45 days in advance.' })
  }
  next()
}

const validateEventExistence = async (req, res, next) => {
  const { eventId } = req.params
  const event = await eventService.find(eventId)
  if (!event) {
    return res.status(404).send({ error: 'Event not found' })
  }
  req.event = event // Attach event to the request object
  next()
}

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = {
  validateParticipantLimit,
  validateStartTime,
  validateEventExistence,
  asyncHandler
}
