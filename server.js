const db = require("./models/index");
const app = require("./app");
const config = require("./config/config");

const PORT = config.PORT || process.env.PORT || 8080; // Fallback to process.env.PORT or 8080
const HOSTNAME = config.HOSTNAME || '0.0.0.0';

app.listen(PORT, async () => { //Starts the Express server and listens for incoming requests
    try {
        await db.sequelize.sync(); //synchronize the Sequelize models with the database. creates tables if non-existant
        console.log('Database connected successfully.');
        console.log(`Server is running on http://${HOSTNAME}:${PORT}`);
    } catch (error) {
        console.error('Error during server startup:', error); // Handle database connection failure
        process.exit(1);  // Exit the process with failure if the database connection fails
    }
});
