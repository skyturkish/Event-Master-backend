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
    if (!events.length) return res.status(404).send({ error: 'noEventsFound' })
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

    if (user && user.status === status) {
      res.send(req.event)
    } else {
      if (req.event.status !== 'not-started' && req.event.status !== 'ready-to-start') {
        const statusMessages = {
          ongoing: 'thisEventIsCurrentlyOngoing',
          finished: 'thisEventHasAlreadyFinished',
          canceled: 'thisEventHasBeenCanceled'
        }

        return res.status(400).send({ error: statusMessages[req.event.status] || 'invalidStatus' })
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
    }
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
        error: 'participantLimitCannotBeLessThanNumberOfAttendingUsers'
      })
    }

    const event = await eventService.update(eventId, req.body)

    res.send(event)
  })
)

router.post('/run-cron', async (req, res) => {
  try {
    const oneDayAgo = new Date(new Date().getTime() - 24 * 60 * 60 * 1000)

    const events = await eventService.getExpiredEvents()

    console.log('Events fetched:', events)

    for (const event of events) {
      console.log('Processing event:', event._id, 'with startTime:', event.startTime)

      if (event.startTime <= oneDayAgo) {
        event.status = 'finished'
        await event.save()
        console.log('Event updated to finished:', event._id)
      } else {
        console.log('Event startTime is after one day ago, skipping:', event._id)
      }
    }

    res.status(200).send(`${events.length} events updated to finished.`)
  } catch (error) {
    console.error('Error updating events:', error)
    res.status(500).send('Error updating events.', error)
  }
})

module.exports = router
