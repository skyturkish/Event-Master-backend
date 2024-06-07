const BaseService = require('./base-service')

const Event = require('../models/event')

class EventService extends BaseService {
  async findByGuildId(guild) {
    return this.model.find({ guild })
  }
}

module.exports = new EventService(Event)
