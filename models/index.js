const { Sequelize } = require("sequelize");
const dbConfig = require("../config/config.js");

// Environment Setup: production or development
const environment = process.env.NODE_ENV || 'development';
console.log(`Running in ${environment} mode`);
const dbConfig = config[environment];

// Initialize Sequelize with PostgreSQL settings
const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    port: dbConfig.port, 
    logging: false, // Change to true for debugging
});

const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
