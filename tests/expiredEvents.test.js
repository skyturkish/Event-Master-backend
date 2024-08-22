const request = require('supertest')
const mongoose = require('mongoose')
const app = require('../index')
const Event = mongoose.model('Event')
const eventService = require('../services/event-service')

beforeAll(async () => {
  mongoose.connect(process.env.MONGODB_URL || 'mongodb://0.0.0.0:27017/event-master', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})

beforeEach(async () => {
  await Event.deleteMany({})
})

test('getExpiredEvents - it should return events that are expired but not finished or canceled', async () => {
  const pastDate = new Date(Date.now() - 48 * 60 * 60 * 1000) // 2 days ago
  const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day in the future

  const events = [
    {
      title: 'Expired Event 1',
      description: 'This event should be returned',
      creator: '774199734662725662',
      guild: '1264210046905225346',
      participantLimit: 2,
      startTime: pastDate,
      status: 'not-started'
    },
    {
      title: 'Expired Event 2',
      description: 'This event should also be returned',
      creator: '774199734662725662',
      guild: '1264210046905225346',
      participantLimit: 2,
      startTime: pastDate,
      status: 'ongoing'
    },
    {
      title: 'Finished Event',
      description: 'This event should NOT be returned',
      creator: '774199734662725662',
      guild: '1264210046905225346',
      participantLimit: 2,
      startTime: pastDate,
      status: 'finished'
    },
    {
      title: 'Canceled Event',
      description: 'This event should NOT be returned',
      creator: '774199734662725662',
      guild: '1264210046905225346',
      participantLimit: 2,
      startTime: pastDate,
      status: 'canceled'
    },
    {
      title: 'Future Event',
      description: 'This event should NOT be returned',
      creator: '774199734662725662',
      guild: '1264210046905225346',
      participantLimit: 2,
      startTime: futureDate,
      status: 'not-started'
    },
    {
      title: 'Passted event Event',
      description: 'This event should NOT be returned',
      creator: '774199734662725662',
      guild: '1264210046005225346',
      participantLimit: 2,
      startTime: pastDate,
      status: 'ongoing'
    }
  ]

  await Event.insertMany(events)

  const expiredEvents = await eventService.getExpiredEvents()

  expect(expiredEvents.length).toBe(3)
  expect(expiredEvents.find((event) => event.title === 'Expired Event 1')).toBeTruthy()
  expect(expiredEvents.find((event) => event.title === 'Expired Event 2')).toBeTruthy()
  expect(expiredEvents.find((event) => event.title === 'Finished Event')).toBeFalsy()
  expect(expiredEvents.find((event) => event.title === 'Canceled Event')).toBeFalsy()
  expect(expiredEvents.find((event) => event.title === 'Future Event')).toBeFalsy()
})
