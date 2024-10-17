const request = require('supertest');
const app = require('../app');  // Express app
const db = require('../models/index'); // Import database connection
const bcrypt = require('bcrypt'); // bcrypt kept for potential use in hashing passwords
const User = require('../models/user.model');
const suffix = Date.now().toString(); // Unique suffix to avoid collisions

describe('Integration Test', () => {
    const userData = {
        first_name: "angel",
        last_name: "fer",
        password: "angel123", // Plain text for test, bcrypt can hash this in the app
        email: `angel_${suffix}@email.com`
    };

    const authHeader = 'Basic ' + Buffer.from(`${userData.email}:${userData.password}`).toString('base64');


    beforeAll(async () => {
        // Sync the database before running tests
        await db.sequelize.sync({ force: true }).catch(error => console.error("Database Error:", error));
    });

    it('TEST 1 - Create user and validate using GET call', async () => {
        const res = await request(app)
            .post("/v1/user")
            .send(userData);

        expect(res.statusCode).toBe(201); // Check if user is created

        const validate = await request(app)
            .get("/v1/user/self")
            .set("Authorization", authHeader); // Use Basic auth to get user details

        expect(validate.statusCode).toBe(200); // Check if user is retrieved
        expect(validate.body.email).toBe(userData.email); // Validate email
    });

    it('TEST 2 - Update user and validate using GET call', async () => {
        const newUserData = {
            first_name: "angel123",
            last_name: "fer",
            email: `${userData.email}`, // email remains the same
            password: "Newpass123" // Update password
        };

        const updatedPassword = Buffer.from(`${newUserData.email}:${newUserData.password}`).toString('base64');
        const newAuthHeader = `Basic ${updatedPassword}`;

        const updateUser = await request(app)
            .put("/v1/user/self")
            .set("Authorization", authHeader) // Use old auth header to authenticate
            .send(newUserData); // Send new data to update

        expect(updateUser.statusCode).toBe(204); // Check if update is successful (No Content)

        const validateChanges = await request(app)
            .get("/v1/user/self")
            .set("Authorization", newAuthHeader); // Use updated auth header

        expect(validateChanges.statusCode).toBe(200); // Check if updated user is retrieved
        expect(validateChanges.body.first_name).toBe(newUserData.first_name); // Validate updated first name
    });

    afterAll(async () => {
        // Clean up the user after tests
        await User.destroy({
            where: {
                email: userData.email
            }
        }).catch(error => console.error("Cleanup failed:", error));
    });
});
