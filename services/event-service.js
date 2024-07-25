const BaseService = require('./base-service')
const Event = require('../models/event')

class EventService extends BaseService {
  async findByCriteria(guild, status, userDiscordID, userStatus, creator) {
    const query = {}
    if (guild) query.guild = guild
    if (status) query.status = status
    if (userDiscordID) {
      if (userStatus) {
        query['users'] = {
          $elemMatch: { discordID: userDiscordID, status: userStatus }
        }
      } else {
        query['users.discordID'] = userDiscordID
      }
    }
    if (creator) query.creator = creator
    return this.model.find(query)
  }
}

module.exports = new EventService(Event)
