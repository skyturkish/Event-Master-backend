const BaseService = require('./base-service')
const Event = require('../models/event')

class EventService extends BaseService {
  async addOrUpdateUser(eventId, userId, status = 'invited') {
    const event = await this.find(eventId)
    if (!event) {
      throw new Error('Event not found')
    }

    const user = event.users.find((p) => p.discordID === userId)
    if (user) {
      user.status = status
    } else {
      event.users.push({ discordID: userId, status })
    }

    await event.save()
    return event
  }

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

  async updateEvent(eventId, eventData) {
    const updatedEvent = await this.model.findByIdAndUpdate(eventId, eventData, { new: true, runValidators: true })
    if (!updatedEvent) {
      throw new Error('Event not found')
    }
    return updatedEvent
  }
}

module.exports = new EventService(Event)
