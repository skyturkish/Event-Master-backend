const router = require('express').Router()
const eventService = require('../services/event-service')

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { guild } = req.query

    if (guild) {
      const events = await eventService.findByGuildId(guild)

      if (!events.length) return res.status(404).send('No events found for this guild')

      return res.send(events)
    }

    const events = await eventService.load()
    res.send(events)
  })
)

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const event = await eventService.insert(req.body)
    res.send(event)
  })
)

router.get(
  '/:eventId',
  asyncHandler(async (req, res) => {
    const { eventId } = req.params

    const event = await eventService.find(eventId)

    if (!event) return res.status(404).send('Cannot find event')

    res.send(event)
  })
)

router.put(
  '/:eventId/participants/:participantId',
  asyncHandler(async (req, res) => {
    const { eventId, participantId } = req.params
    const { status } = req.body

    const event = await eventService.addOrUpdateParticipant(eventId, participantId, status)
    res.send(event)
  })
)

module.exports = router
