const redis = require('redis');
const client = redis.createClient({
    url: 'redis://localhost:6379',
    retry_strategy: function (options) {
        if (options.error && options.error.code === 'ECONNREFUSED') {
            console.error('Connection to redis server refused');
        }
        if (options.total_retry_time > 1000 * 60 * 5) {
            return new Error('retry timeout');
        }
        if (options.attempt > 10) {
            return undefined;
        }
        return Math.min(options.attempt * 100, 3000);
    }
});

client.connect()

client.on('connect', () => {
    console.log('Connect to Redis');
});

client.on('error', (err) => {
    console.error('Error Redis:', err);
});

module.exports = client;
