const BaseService = require('./base-service')

const Event = require('../models/event')

class EventService extends BaseService {}

module.exports = new EventService(Event)
