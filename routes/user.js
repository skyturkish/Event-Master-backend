const router = require('express').Router()
const userService = require('../services/user-service')

router.get('/', async (req, res) => {
  const users = await userService.load()

  res.send(users)
})

module.exports = router
