const BaseService = require('./base-service')

const Event = require('../models/event')

class EventService extends BaseService {
  async findByGuildId(guild) {
    return this.model.find({ guild })
  }

  async addOrUpdateParticipant(eventId, participantId, status = 'invited') {
    const event = await this.find(eventId)
    if (!event) {
      throw new Error('Event not found')
    }

    let participant = event.participants.find((p) => p.discordID === participantId)
    if (participant) {
      participant.status = status
    } else {
      event.participants.push({ discordID: participantId, status })
    }

    await event.save()
    return event
  }
}

module.exports = new EventService(Event)
