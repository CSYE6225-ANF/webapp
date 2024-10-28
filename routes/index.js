const express = require('express');
const router = express.Router();
const healthRoutes = require('./health.route');
const userRoutes = require('./user.route');
const imageRoutes = require('./image.route');

router.use('/healthz', healthRoutes);  // Use the health routes
router.use('/v1/user', userRoutes); // Use the user routes
router.use('/v1/user', imageRoutes); // Use the image routes

module.exports = router;
