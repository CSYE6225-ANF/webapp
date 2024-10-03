const express = require('express');
const app = express();
const healthRoutes = require('./routes/health.route');
const userRoutes = require('./routes/user.route');

// Middleware to parse JSON
app.use(express.json());

// Use health routes
app.use('/healthz', healthRoutes);

// Use user routes
app.use('/v1/user', userRoutes);

module.exports = app;  // Export the app
