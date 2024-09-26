const config = require("./config/config.js");
const express = require('express');
const routes = require("./routes/index");

const app = express();

app.use(express.json());

app.use('/', routes);

app.use('*', (req, res) => { // 404 Handler
    res.status(404).send('Route not found');
});

module.exports = app;
