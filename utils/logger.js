const { createLogger, format, transports } = require('winston');
const path = require('path');

// Define a fixed log path
const logPath = path.join('var', 'log', 'app.log');

const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: logPath, level: 'info' })
    ],
});

module.exports = logger;
