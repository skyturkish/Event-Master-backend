const moment = require('moment')
const eventService = require('../services/event-service')

const validateParticipantLimit = (req, res, next) => {
  const { participantLimit } = req.body

  if (participantLimit === undefined) return next()

  if (isNaN(participantLimit) || participantLimit <= 0 || participantLimit > 1024) {
    return res.status(400).send({ error: 'participantLimitMustBeANumberBetween1And1024' })
  }
  next()
}

const validateStartTimeForCreate = (req, res, next) => {
  const { startTime } = req.body
  const eventTime = moment(startTime)

  if (!eventTime.isValid()) return res.status(400).send({ error: 'invalidStartTimeFormat' })

  const now = moment()

  if (eventTime.isBefore(now)) return res.status(400).send({ error: 'cannotInteractWithEventInThePast' })

  const maxAdvanceTime = moment().add(45, 'days')

  if (eventTime.isAfter(maxAdvanceTime))
    return res.status(400).send({ error: 'cannotCreateEventMoreThan45DaysInAdvance' })

  next()
}

const validateStartTimeForUpdate = (req, res, next) => {
  const { startTime } = req.body
  const eventStartTime = moment(req.event.startTime).toISOString()
  const eventTime = moment(startTime)
  const formattedEventTime = eventTime.toISOString()

  if (!startTime && !eventTime.isValid()) return res.status(400).send({ error: 'invalidStartTimeFormat' })

  if (!startTime || eventStartTime === formattedEventTime) {
  } else {
    const now = moment()

    if (eventTime.isBefore(now)) return res.status(400).send({ error: 'cannotInteractWithEventInThePast' })

    const maxAdvanceTime = moment().add(45, 'days')

    if (eventTime.isAfter(maxAdvanceTime))
      return res.status(400).send({ error: 'cannotCreateEventMoreThan45DaysInAdvance' })
  }

  next()
}

const validateStatus = (req, res, next) => {
  const currentParticipants = req.event.users.filter((user) => user.status === 'attending').length

  const currentStatus = req.event.status

  const newStatus = req.body.status

  if (currentStatus == newStatus) {
  } else {
    if (newStatus == 'not-started') return res.status(400).send({ error: 'cannotChangeStatusToNotStarted' })
    else if (newStatus == 'ready-to-start') {
      if (currentStatus == 'not-started') {
        if (currentParticipants != req.event.participantLimit)
          return res.status(400).send({
            error: 'participantLimitMustEqualAttendingUsersToMarkReady'
          })
      } else return res.status(400).send({ error: 'onlyNotStartedEventsCanBeMarkedReady' })
    } else if (newStatus == 'ongoing') {
      if (currentStatus == 'not-started') return res.status(400).send({ error: 'cannotStartEventNotReady' })
      else if (currentStatus == 'finished') {
        return res.status(400).send({ error: 'cannotStartFinishedEvent' })
      } else if (currentStatus == 'canceled') {
        return res.status(400).send({ error: 'cannotStartCanceledEvent' })
      }
    } else if (newStatus == 'finished') {
      if (currentStatus == 'not-started' || currentStatus == 'ready-to-start')
        return res.status(400).send({ error: 'cannotFinishNotStartedEvent' })
      else if (currentStatus == 'canceled') return res.status(400).send({ error: 'cannotFinishCanceledEvent' })
    } else if (newStatus == 'canceled') {
      if (currentStatus == 'ongoing') return res.status(400).send({ error: 'cannotCancelOngoingEvent' })
      else if (currentStatus == 'finished') return res.status(400).send({ error: 'cannotCancelFinishedEvent' })
    }
    next()
  }
}

const validateEventExistence = async (req, res, next) => {
  const { eventId } = req.params
  const event = await eventService.find(eventId)
  if (!event) {
    return res.status(404).send({ error: 'eventNotFound' })
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
