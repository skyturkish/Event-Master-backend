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

const validateStartTimeForCreate = (req, res, next) => {
  const { startTime } = req.body
  const eventTime = moment(startTime)

  if (!eventTime.isValid()) return res.status(400).send({ error: 'Invalid start time format.' })

  const now = moment()

  if (eventTime.isBefore(now)) return res.status(400).send({ error: 'You cannot interact with an event in the past.' })

  const maxAdvanceTime = moment().add(45, 'days')

  if (eventTime.isAfter(maxAdvanceTime))
    return res.status(400).send({ error: 'You cannot create an event more than 45 days in advance.' })

  next()
}

const validateStartTimeForUpdate = (req, res, next) => {
  const { startTime } = req.body
  const eventStartTime = moment(req.event.startTime).toISOString()
  const eventTime = moment(startTime)
  const formattedEventTime = eventTime.toISOString()

  if (startTime && req.event) {
    if (eventStartTime === formattedEventTime) {
    } else {
      if (!eventTime.isValid()) return res.status(400).send({ error: 'Invalid start time format.' })

      const now = moment()

      if (eventTime.isBefore(now))
        return res.status(400).send({ error: 'You cannot interact with an event in the past.' })

      const maxAdvanceTime = moment().add(45, 'days')

      if (eventTime.isAfter(maxAdvanceTime))
        return res.status(400).send({ error: 'You cannot create an event more than 45 days in advance.' })
    }
  }
  next()
}

const validateStatus = (req, res, next) => {
  const currentParticipants = req.event.users.filter((user) => user.status === 'attending').length

  const currentStatus = req.event.status

  const newStatus = req.body.status

  if (currentStatus == newStatus) {
  } else {
    if (newStatus == 'not-started')
      return res.status(400).send({ error: 'You cannot change the status back to not-started.' })
    else if (newStatus == 'ready-to-start') {
      if (currentStatus == 'not-started') {
        if (currentParticipants != req.event.participantLimit)
          return res.status(400).send({
            error: 'Participant limit must be equal to current number of attending users to mark as ready to start'
          })
      } else
        return res.status(400).send({ error: 'Only events that have not yet started can be marked as ready-to-start.' })
    } else if (newStatus == 'ongoing') {
      if (currentStatus == 'not-started')
        return res.status(400).send({ error: 'You cannot start the event that not ready to start' })
      else if (currentStatus == 'ready-to-start') {
        if (currentParticipants != req.event.participantLimit)
          return res.status(400).send({
            error: 'Participant limit must be equal to current number of attending users to mark as ready to start'
          })
      } else if (currentStatus == 'finished') {
        return res.status(400).send({ error: 'You cannot start a finished event.' })
      } else if (currentStatus == 'canceled') {
        return res.status(400).send({ error: 'You cannot start a canceled event.' })
      }
    } else if (newStatus == 'finished') {
      if (currentStatus == 'not-started' || currentStatus == 'ready-to-start')
        return res.status(400).send({ error: 'You cannot finish an event that has not started yet.' })
      else if (currentStatus == 'canceled')
        return res.status(400).send({ error: 'You cannot finish a canceled event.' })
    } else if (newStatus == 'canceled') {
      if (currentStatus == 'ongoing') return res.status(400).send({ error: 'You cannot cancel an ongoing event.' })
      else if (currentStatus == 'finished')
        return res.status(400).send({ error: 'You cannot cancel a finished event.' })
    }
    next()
  }
}

const validateEventExistence = async (req, res, next) => {
  const { eventId } = req.params
  const event = await eventService.find(eventId)
  if (!event) {
    return res.status(404).send({ error: 'Event not found' })
  }
  req.event = event
  next()
}

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = {
  validateParticipantLimit,
  validateStartTimeForCreate,
  validateStartTimeForUpdate,
  validateEventExistence,
  validateStatus,
  asyncHandler
}
