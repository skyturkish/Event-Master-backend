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

  async findByCriteria(guild, status, participantDiscordID) {
    const query = {}
    if (guild) query.guild = guild
    if (status) query.status = status
    if (participantDiscordID) query['participants.discordID'] = participantDiscordID
    console.log('query:', query)

    return this.model.find(query)
  }
}

module.exports = new EventService(Event)
