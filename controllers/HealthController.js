const db = require('../models/index');
const logger = require('../utils/logger');
const statsdClient = require('../utils/statsd');

// Health check API
const healthz = async (req, res) => {
    // Start tracking time for the API call
    const startTime = Date.now();
    statsdClient.increment('api.healthz.count'); // Increment count for each call

    const headers = {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
    };

    try {
        // Check if the request method is GET
        if (req.method !== 'GET') {
            logger.warn('Non-GET method used on healthz endpoint');
            return res.status(405).header(headers).send(); // Method Not Allowed
        }

        // Reject requests with payloads
        if (Object.keys(req.body).length > 0 || req.originalUrl.includes('?')) {
            logger.warn('Payload included in healthz request');
            return res.status(400).header(headers).send();
        }

        // Attempt to authenticate with the database
        await db.sequelize.authenticate();
        res.status(200).header(headers).send();  // Successful

        // Log successful health check
        logger.info('Health check successful');
    } catch (error) {
        // Log database authentication failure
        logger.error(`Database connection failed on healthz: ${error.message}`);
        res.status(503).header(headers).send();  // Unsuccessful
    } finally {
        // Calculate and log the time taken for the request
        const duration = Date.now() - startTime;
        statsdClient.timing('api.healthz.duration', duration); // Timer metric in ms
        logger.info(`Healthz API call duration: ${duration}ms`);
    }
};

module.exports = { healthz };
