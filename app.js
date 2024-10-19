const express = require('express');
const app = express();
const indexRoutes = require('./routes/index');

// Middleware to parse JSON
app.use(express.json());

// Use the centralized routes defined in 'index.js'
app.use('/', indexRoutes);

module.exports = app;  // Export the app
