const express = require('express');
const router = express.Router();
const healthRoutes = require('./health.route');

router.use('/', healthRoutes);  // Use the health routes

module.exports = router;
