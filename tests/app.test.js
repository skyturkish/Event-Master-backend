const request = require('supertest')
const mongoose = require('mongoose')
const app = require('.././index')
const Event = mongoose.model('Event')

beforeAll(async () => {
  mongoose.connect(process.env.MONGODB_URL || 'mongodb://0.0.0.0:27017/event-master')
})

afterAll(async () => {
  await mongoose.connection.close()
})

beforeEach(async () => {
  await Event.deleteMany({})
})

test('POST /event - it should create an event', async () => {
  const newEvent = {
    title: 'Muhammed',
    description: 'No description provided.',
    creator: '774199734662725662',
    guild: '1264210046905225346',
    participantLimit: 2,
    startTime: '2024-07-30T18:00:00.000Z'
  }

  const response = await request(app).post('/event').send(newEvent)

  expect(response.status).toBe(200)
  expect(response.body).toHaveProperty('_id')
  expect(response.body.title).toBe(newEvent.title)
  expect(response.body.description).toBe(newEvent.description)
  expect(response.body.participantLimit).toBe(newEvent.participantLimit)
  expect(response.body.startTime).toBe(newEvent.startTime)
})

test('GET /event/:eventId - it should retrieve the created event by ID', async () => {
  const newEvent = {
    title: 'Muhammed',
    description: 'No description provided.',
    creator: '774199734662725662',
    guild: '1264210046905225346',
    participantLimit: 2,
    startTime: '2024-07-30T18:00:00.000Z'
  }

  const createResponse = await request(app).post('/event').send(newEvent)
  const eventId = createResponse.body._id

  const response = await request(app).get(`/event/${eventId}`)

  expect(response.status).toBe(200)
  expect(response.body._id).toBe(eventId)
  expect(response.body.title).toBe(newEvent.title)
  expect(response.body.description).toBe(newEvent.description)
  expect(response.body.participantLimit).toBe(newEvent.participantLimit)
  expect(response.body.startTime).toBe(newEvent.startTime)
})
