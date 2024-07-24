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

test('The first user on the waitlist joins the event when a participant leaves', async () => {
  const newEvent = {
    title: '2 kişilik CS:GO turnuvası',
    creator: '213902184092',
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

  const updateUserStatus = async (userId, status) => {
    return await request(app).put(`/event/${eventId}/users/${userId}`).send({ status })
  }

  let event = await updateUserStatus('123218739812', 'declined')

  event = await request(app).get(`/event/${eventId}`)

  expect(event.body.users.length).toBe(1)
  await updateUserStatus('43232423423', 'attending')
  event = await updateUserStatus('4234324324', 'attending')

  let attendingUsers = event.body.users.filter((user) => user.status === 'attending')

  if (attendingUsers.length === event.body.participantLimit) {
    event = await request(app).put(`/event/${eventId}`).send({
      status: 'ready-to-start'
    })
  }

  event = await request(app).get(`/event/${eventId}`)

  expect(event.body.status).toBe('ready-to-start')

  event = await updateUserStatus('1232187398125', 'attending')

  expect(event.body.users.length).toBe(4)

  attendingUsers = event.body.users.filter((user) => user.status === 'attending')

  expect(attendingUsers.length).toBe(2)

  await updateUserStatus('5235325325', 'attending')
  await updateUserStatus('5235235235', 'declined')
  await updateUserStatus('4234234224', 'declined')
  event = await updateUserStatus('423423423', 'declined')

  expect(event.body.users.length).toBe(8)

  attendingUsers = event.body.users.filter((user) => user.status === 'attending')

  expect(attendingUsers.length).toBe(2)

  const waitListUsers = event.body.users.filter((user) => user.status === 'waitlist')

  expect(waitListUsers.length).toBe(2)

  await updateUserStatus('123218739812', 'attending')
  await updateUserStatus('732984732894239', 'attending')
  event = await updateUserStatus('1232187398152', 'attending')

  event.body.users.filter((user) => user.status === 'waitlist')

  expect(event.body.users.find((user) => user.status === 'waitlist').discordID).toBe('1232187398125')

  event = await updateUserStatus('1232187398125', 'declined')

  expect(event.body.users.find((user) => user.status === 'waitlist').discordID).toBe('5235325325')
})

// test('little test', async () => {
//   const newEvent = {
//     title: '3 kişilik CS:GO turnuvası',
//     creator: '213902184092',
//     guild: '1264210046905225346',
//     participantLimit: 3,
//     startTime: '2024-07-30T18:00:00.000Z'
//   }

//   const createResponse = await request(app).post('/event').send(newEvent)
//   const eventId = createResponse.body._id

//   const response = await request(app).get(`/event/${eventId}`)

//   expect(response.status).toBe(200)
//   expect(response.body._id).toBe(eventId)
//   expect(response.body.title).toBe(newEvent.title)
//   expect(response.body.description).toBe(newEvent.description)
//   expect(response.body.participantLimit).toBe(newEvent.participantLimit)
//   expect(response.body.startTime).toBe(newEvent.startTime)

//   const updateUserStatus = async (userId, status) => {
//     return await request(app).put(`/event/${eventId}/users/${userId}`).send({ status })
//   }

//   await updateUserStatus('123218739812', 'attending')
//   await updateUserStatus('12381273129837129', 'attending')
//   let event = await updateUserStatus('40912839012380912', 'attending')

//   let attendingUsers = event.body.users.filter((user) => user.status === 'attending')

//   if (attendingUsers.length === event.body.participantLimit) {
//     event = await request(app).put(`/event/${eventId}`).send({
//       status: 'ready-to-start'
//     })
//   }

//   event = await request(app).get(`/event/${eventId}`)

//   expect(event.body.users.length).toBe(3)
//   await updateUserStatus('43232423423', 'attending')
//   event = await updateUserStatus('4234324324', 'attending')

//   console.log('event', event.body)

//   event = await updateUserStatus('12381273129837129', 'declined')

//   console.log('event', event.body)

//   expect(event.body.users.find((user) => user.status === 'waitlist').discordID).toBe('43232423423')
// })
