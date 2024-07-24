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
    const { guild, statuses, userDiscordID, userStatus, creator } = req.query
    console.log('get events by these queries', guild, statuses, userDiscordID, userStatus, creator)
    const events = await eventService.findByCriteria(guild, statuses, userDiscordID, userStatus, creator)
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

    let currentParticipants = req.event.users.filter((user) => user.status === 'attending')
    let newStatus = status

    if (
      req.event.status === 'ready-to-start' &&
      currentParticipants.length === req.event.participantLimit &&
      newStatus === 'attending'
    ) {
      newStatus = 'waitlist'
    }

    if (user) {
      user.status = newStatus
    } else {
      req.event.users.push({ discordID: userId, status: newStatus })
    }

    let event = await req.event.save()

    currentParticipants = event.users.filter((user) => user.status === 'attending')

    if (
      req.event.participantLimit > currentParticipants.length &&
      event.users.some((user) => user.status === 'waitlist')
    ) {
      const waitlistUser = event.users.find((user) => user.status === 'waitlist')
      waitlistUser.status = 'attending'
      event = await event.save()
      // send notification to user
    }

    res.send(event)
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

    console.log('update event', eventId, req.body, currentParticipants)

    if (participantLimit && currentParticipants > participantLimit) {
      return res.status(400).send({
        error: `Participant limit cannot be less than current number of attending users: ${currentParticipants}`
      })
    }

    const event = await eventService.update(eventId, req.body)

    res.send(event)
  })
)

module.exports = router
