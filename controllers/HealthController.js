const db = require('../models/index');

const healthz = async (req, res) => {
    const headers = {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
    };
    
    // Check if the request method is GET
    if (req.method !== 'GET') {
        return res.status(405).header(headers).send(); // Method Not Allowed
    }

    // Reject requests with payloads
    if (Object.keys(req.body).length > 0 || req.originalUrl.includes('?')) {
        return res.status(400).header(headers).send();
    }

    try {
        await db.sequelize.authenticate();
        res.status(200).header(headers).send();  // Successful
    } catch (error) {
        res.status(503).header(headers).send();  // Unsuccessful
    }
};

module.exports = { healthz };  // Export the health check function
