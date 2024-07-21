const router = require('express').Router()
const eventService = require('../services/event-service')
const {
  validateParticipantLimit,
  validateStartTimeForCreate,
  validateStartTimeForUpdate,
  validateEventExistence,
  validateStatus,
  asyncHandler
} = require('../middleware/event-middleware')

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { guild, status, userDiscordID, userStatus, creator } = req.query
    console.log('get events by these queries', guild, status, userDiscordID, userStatus, creator)
    const events = await eventService.findByCriteria(guild, status, userDiscordID, userStatus, creator)
    console.log('found events', events)
    if (!events.length) return res.status(404).send({ error: 'No events found' })
    res.send(events)
  })
)

router.post(
  '/',
  validateParticipantLimit,
  validateStartTimeForCreate,
  asyncHandler(async (req, res) => {
    console.log('create event', req.body)
    const event = await eventService.insert(req.body)
    console.log('created event', req.body)
    res.send(event)
  })
)

router.get(
  '/:eventId',
  validateEventExistence,
  asyncHandler(async (req, res) => {
    console.log('get event', req.event)
    res.send(req.event)
  })
)

router.put(
  '/:eventId/users/:userId',
  validateEventExistence,
  asyncHandler(async (req, res) => {
    const { userId } = req.params
    const { status } = req.body
    const user = req.event.users.find((p) => p.discordID === userId)
    console.log('update user', userId, status, user)

    if (req.event.status !== 'not-started' && req.event.status !== 'ready-to-start') {
      const statusMessages = {
        ongoing: 'This event is currently ongoing, you can no longer make a decision.',
        finished: 'This event has already finished, you can no longer make a decision.',
        canceled: 'This event has been canceled, you can no longer make a decision.'
      }

      return res.status(400).send({ error: statusMessages[req.event.status] || 'Invalid status' })
    }

    if (user) {
      user.status = status
    } else {
      req.event.users.push({ discordID: userId, status })
    }
    await req.event.save()
    res.send(req.event)
  })
)

router.put(
  '/:eventId',
  validateEventExistence,
  validateParticipantLimit,
  validateStartTimeForUpdate,
  validateStatus,
  asyncHandler(async (req, res) => {
    const { eventId } = req.params
    const { participantLimit } = req.body
    const currentParticipants = req.event.users.filter((user) => user.status === 'attending').length
    const currentStatus = req.event.status

    console.log('update event', eventId, req.body, currentParticipants)

    if (participantLimit && currentParticipants > participantLimit) {
      return res.status(400).send({
        error: `Participant limit cannot be less than current number of attending users: ${currentParticipants}`
      })
    }
    const updatedEvent = await eventService.updateEvent(eventId, req.body)
    res.send(updatedEvent)
  })
)

module.exports = router
