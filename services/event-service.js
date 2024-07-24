const BaseService = require('./base-service')
const Event = require('../models/event')

class EventService extends BaseService {
  async findByCriteria(guild, statuses, userDiscordID, userStatus, creator) {
    const query = {}
    if (guild) query.guild = guild
    if (statuses) query.status = { $in: statuses.split(',').map((status) => status.trim()) }
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
