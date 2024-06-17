const router = require('express').Router()
const eventService = require('../services/event-service')
const moment = require('moment')

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

router.get(
  '/',
  asyncHandler(async (req, res) => {
    try {
      // await eventService.deleteAllEvents()
      const { guild, status, userDiscordID, userStatus, creator } = req.query

      const events = await eventService.findByCriteria(guild, status, userDiscordID, userStatus, creator)

      if (!events.length) return res.status(404).send({ error: 'No events found' })

      res.send(events)
    } catch (error) {
      console.log('Error fetching events:', error)
      res.status(500).send({ error: 'An error occurred while fetching events' })
    }
  })
)

router.post(
  '/',
  asyncHandler(async (req, res) => {
    try {
      const { title, description, participantLimit, startTime, guild, creator } = req.body

      if (isNaN(participantLimit) || participantLimit < 0 || participantLimit > 1000) {
        return res.status(500).send({ error: 'Participant limit must be a number between 0 and 1000.' })
      }

      const eventTime = moment(startTime)

      if (!eventTime.isValid()) {
        return res.status(500).send({ error: 'Invalid start time format.' })
      }

      const now = moment()
      if (eventTime.isBefore(now)) {
        return res.status(500).send({ error: 'You cannot create an event in the past.' })
      }

      const maxAdvanceTime = moment().add(45, 'days')
      if (eventTime.isAfter(maxAdvanceTime)) {
        return res.status(500).send({ error: 'You cannot create an event more than 45 days in advance.' })
      }

      const event = await eventService.insert(req.body)

      res.send(event)
    } catch (error) {
      console.log('Error creating event:', error)
      res.status(500).send({ error: 'An error occurred while creating the event' })
    }
  })
)

router.get(
  '/:eventId',
  asyncHandler(async (req, res) => {
    try {
      const { eventId } = req.params

      const event = await eventService.find(eventId)

      if (!event) return res.status(404).send({ error: 'Event not found' })

      res.send(event)
    } catch (error) {
      res.status(500).send({ error: 'An error occurred while fetching the event' })
    }
  })
)

router.put(
  '/:eventId/users/:userId',
  asyncHandler(async (req, res) => {
    try {
      const { eventId, userId } = req.params

      const { status } = req.body

      const event = await this.find(eventId)

      if (!event) return res.status(404).send({ error: 'Event not found' })

      const user = event.users.find((p) => p.discordID === userId)

      if (user) {
        user.status = status
      } else {
        event.users.push({ discordID: userId, status })
      }
      await event.save()

      res.send(event)
    } catch (error) {
      res.status(500).send({ error: 'An error occurred while updating the user status' })
    }
  })
)

router.put(
  '/:eventId',
  asyncHandler(async (req, res) => {
    try {
      const { eventId } = req.params
      const eventData = req.body
      const event = await eventService.find(eventId)

      if (!event) return res.status(404).send({ error: 'Event not found' })

      const currentParticipants = event.users.filter((user) => user.status === 'attending').length
      if (eventData.participantLimit && currentParticipants > eventData.participantLimit) {
        return res.status(400).send({
          error: `Participant limit cannot be less than current number of attending users: ${currentParticipants}`
        })
      }
      const updatedEvent = await eventService.updateEvent(eventId, eventData)
      res.send(updatedEvent)
    } catch (error) {
      return res.status(500).send({ error: 'An error occurred while updating the event' })
    }
  })
)

module.exports = router
