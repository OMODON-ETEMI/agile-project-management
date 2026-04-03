const redis = require('redis');
const eventBus = require('./eventBus');

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const client = redis.createClient({url: REDIS_URL});

module.exports.start = async () => {
    await client.connect()

    await client.subscribe("organization_events", (message) => {
        data = JSON.parse(message)
        eventBus.emit("notification:create", data)
    })

    console.log('Redis is running...')
}