const redis = require('redis');
const eventBus = require('./eventBus');

const client = redis.createClient({url: "redis://redis:6379"});

module.exports.start = async () => {
    await client.connect()

    await client.subscribe("organization_events", (message) => {
        data = JSON.parse(message)
        console.log('NODE RECIEVED: ',data)

        eventBus.emit("notification:create", data)
    })

    console.log('Redis is running...')
}