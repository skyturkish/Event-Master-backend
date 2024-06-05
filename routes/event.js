const router = require('express').Router()
const eventService = require('../services/event-service')

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

router.get(
  '/',
  asyncHandler(async (req, res) => {
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

module.exports = router
