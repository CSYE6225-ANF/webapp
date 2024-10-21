require("dotenv").config();
module.exports = {
    DB_HOST: process.env.DB_HOST,
    DB_USER: process.env.DB_USER || 'csye6225',
    DB_PASSWORD: process.env.DB_PASSWORD || 'csye6225',
    DB_NAME: process.env.DB_NAME || 'csye6225',
    DB_PORT: process.env.DB_PORT || 5432,
    PORT: process.env.PORT,
    // HOSTNAME: process.env.HOSTNAME,
    dialect: "postgres",
};
