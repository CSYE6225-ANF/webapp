const { Sequelize } = require("sequelize");
const dbConfig = require("../config/config.js");

// Initialize Sequelize with PostgreSQL settings
const sequelize = new Sequelize(dbConfig.DB_NAME, dbConfig.DB_USER, dbConfig.DB_PASSWORD, {
    host: dbConfig.DB_HOST,
    dialect: dbConfig.dialect,
    port: dbConfig.port, 
    logging: false, // Change to true for debugging
});

const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
