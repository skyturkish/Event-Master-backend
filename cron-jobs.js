const cron = require('node-cron')
const Event = require('./models/event')

cron.schedule('0 0 * * *', async () => {
  try {
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)

    const events = await Event.find({
      startTime: { $lte: oneDayAgo },
      status: { $nin: ['finished', 'canceled'] }
    })

    for (const event of events) {
      event.status = 'finished'
      await event.save()
    }

    console.log(`${events.length} events updated to finished.`)
  } catch (error) {
    console.error('Error updating events:', error)
  }
})

console.log('Cron jobs are scheduled.')
