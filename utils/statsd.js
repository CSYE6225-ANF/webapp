var Client = require('node-statsd');
const client = new Client('0.0.0.0', 8125);

// Add a close method for Jest cleanup
client.close = function() {
    this.socket && this.socket.close();
};

module.exports = client;
