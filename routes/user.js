const router = require('express').Router()
const userService = require('../services/user-service')

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const users = await userService.load()
    res.send(users)
  })
)

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const user = await userService.insert(req.body)
    res.send(user)
  })
)

module.exports = router
