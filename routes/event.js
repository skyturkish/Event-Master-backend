const router = require('express').Router()
const eventService = require('../services/event-service')
const {
  validateParticipantLimit,
  validateStartTime,
  validateEventExistence,
  asyncHandler
} = require('../middleware/event-middleware')

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { guild, status, userDiscordID, userStatus, creator } = req.query
    const events = await eventService.findByCriteria(guild, status, userDiscordID, userStatus, creator)
    if (!events.length) return res.status(404).send({ error: 'No events found' })
    res.send(events)
  })
)

router.post(
  '/',
  validateParticipantLimit,
  validateStartTime,
  asyncHandler(async (req, res) => {
    const event = await eventService.insert(req.body)
    res.send(event)
  })
)

router.get(
  '/:eventId',
  validateEventExistence,
  asyncHandler(async (req, res) => {
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
  validateStartTime,
  asyncHandler(async (req, res) => {
    const { eventId } = req.params
    const { participantLimit } = req.body
    const currentParticipants = req.event.users.filter((user) => user.status === 'attending').length

    if (req.event.status !== 'not-started')
      // tüm statuler için özel mesaj gönder
      return res.status(400).send({ error: 'You can only update events that have not started yet.' })

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
