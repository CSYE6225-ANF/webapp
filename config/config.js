const config = {
    production: {
        username: process.env.DB_USER || 'csye6225',  // From Terraform
        password: process.env.DB_PASSWORD || 'csye6225', // From Terraform
        database: process.env.DB_NAME || 'csye6225',  // Set your DB name (same as Terraform)
        host: process.env.DB_HOST,                    // RDS endpoint from Terraform
        dialect: 'postgres',
        port: process.env.DB_PORT || 5432,            // Use port 3306 for MySQL/MariaDB
    },
    development: {
        username: 'postgres',  // Local DB user for development/testing
        password: 'postgres',  // Local DB password
        database: 'postgres',  // Local database name for tests
        host: 'localhost',    // Localhost for development
        dialect: 'postgres',
        port: 5432,
    },
};

module.exports = config;
