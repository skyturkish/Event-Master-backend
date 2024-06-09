const router = require('express').Router()
const eventService = require('../services/event-service')

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { guild, status, participantDiscordID, participantStatus, creator } = req.query

    const events = await eventService.findByCriteria(guild, status, participantDiscordID, participantStatus, creator)

    if (!events.length) return res.status(404).send('No events found')

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

router.put(
  '/:eventId',
  asyncHandler(async (req, res) => {
    const { eventId } = req.params
    const eventData = req.body

    const updatedEvent = await eventService.updateEvent(eventId, eventData)
    if (!updatedEvent) return res.status(404).send('Event not found')

    res.send(updatedEvent)
  })
)

module.exports = router
