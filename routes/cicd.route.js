const express = require('express');
const router = express.Router();
const { cicd } = require('../controllers/CicdController');

const headers = {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'X-Content-Type-Options': 'nosniff',
};

router.get('/', cicd);  // Health check
router.all('/', (req, res) => res.status(405).header(headers).send());

module.exports = router;  // Export the router
