const express = require('express');
const router = express.Router();
const { healthz } = require('../controllers/HealthController');

const headers = {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'X-Content-Type-Options': 'nosniff',
};

router.get('/', healthz);  // Health check
router.all('/', (req, res) => res.status(405).header(headers).send());

module.exports = router;  // Export the router

