var Client = require('node-statsd');
const client = new Client("localhost", 8125);
module.exports = client;
