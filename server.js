const db = require("./models/index");
const app = require("./app");
const config = require("./config/config");

const PORT = config.PORT;
const HOSTNAME = config.HOSTNAME;

app.listen(PORT, async () => { //Starts the Express server and listens for incoming requests
    try {
        await db.sequelize.sync(); //synchronize the Sequelize models with the database. creates tables if non-existant
        console.log('Database connected successfully.');
        console.log(`Server is running on http://${HOSTNAME}:${PORT}`);
    } catch (error) {
        console.error('Error during server startup:', error);
    }
});
