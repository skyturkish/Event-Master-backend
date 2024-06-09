const BaseService = require('./base-service')
const Event = require('../models/event')

class EventService extends BaseService {
  async addOrUpdateParticipant(eventId, participantId, status = 'invited') {
    const event = await this.find(eventId)
    if (!event) {
      throw new Error('Event not found')
    }

    const participant = event.participants.find((p) => p.discordID === participantId)
    if (participant) {
      participant.status = status
    } else {
      event.participants.push({ discordID: participantId, status })
    }

    await event.save()
    return event
  }

  async findByCriteria(guild, status, participantDiscordID, participantStatus, creator) {
    const query = {}
    if (guild) query.guild = guild
    if (status) query.status = status
    if (participantDiscordID) {
      if (participantStatus) {
        query['participants'] = {
          $elemMatch: { discordID: participantDiscordID, status: participantStatus }
        }
      } else {
        query['participants.discordID'] = participantDiscordID
      }
    }
    if (creator) query.creator = creator
    console.log('query:', query)

    return this.model.find(query)
  }
}

module.exports = new EventService(Event)
