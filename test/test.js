const request = require('supertest');
const app = require('../app');  // Express app
const db = require('../models/index'); // Import database connection
const bcrypt = require('bcrypt');
const User = require('../models/user.model');

describe('Health Check API', () => {
    // Test for successful connection
    it('should return 200 OK if connection is successful', async () => {
        const res = await request(app).get('/healthz');
        expect(res.statusCode).toBe(200);
    });

    // Test for bad request when a payload is sent
    it('should return 400 Bad Request if request includes any payload', async () => {
        const res = await request(app).get('/healthz').send({ key: "value" });
        expect(res.statusCode).toBe(400);
    });

    // Test for non-GET requests
    it('should return 405 Method Not Allowed for non-GET requests', async () => {
        const res = await request(app).post('/healthz');
        expect(res.statusCode).toBe(405);
    });

    // Test for non-existent routes
    it('should return 404 for non-existent routes', async () => {
        const res = await request(app).get('/non-existent');
        expect(res.statusCode).toBe(404);
    });
});


// describe('User API', () => {
//     beforeAll(async () => {
//         // Sync the database and reset the table before running tests
//         await db.sequelize.sync({ force: true });
//     });

//     let authHeader = ''; // Variable to store authentication token

//     describe('POST /v1/user', () => {
//         // Test for creating a new user
//         it('should create a new user and return 201 Created', async () => {
//             const res = await request(app)
//                 .post('/v1/user')
//                 .send({
//                     first_name: 'Jane',
//                     last_name: 'Doe',
//                     email: 'jane.doe@example.com',
//                     password: 'password123' //'skdjfhskdfjhg'
//                 });

//             expect(res.statusCode).toBe(201);
//             expect(res.body).toHaveProperty('email', 'jane.doe@example.com');
//         });

//          // Test for attempting to create a user with an already existing email
//         it('should return 409 Conflict for an email that already exists', async () => {
//             const res = await request(app)
//                 .post('/v1/user')
//                 .send({
//                     first_name: 'Jane',
//                     last_name: 'Doe',
//                     email: 'jane.doe@example.com',
//                     password: 'skdjfhskdfjhg'
//                 });

//             expect(res.statusCode).toBe(409);
//             expect(res.body.message).toBe('Email already exists');
//         });

//         // Test with missing required fields
//         it('should return 400 Bad Request if required fields are missing', async () => {
//             const res = await request(app)
//                 .post('/v1/user')
//                 .send({
//                     first_name: 'Jane',
//                     last_name: '',
//                     email: 'jane.doe@example.com',
//                     password: 'password123'
//                 });

//             expect(res.statusCode).toBe(400);
//         });
//     });

//     describe('Authentication (GET /v1/user/self)', () => {
//         // Test for user authentication and retrieval of their details
//         it('should authenticate a user and return their details', async () => {
//             // Manually create the Base64-encoded Authorization header
//             authHeader = 'Basic ' + Buffer.from('jane.doe@example.com:password123').toString('base64');

//             const res = await request(app)
//                 .get('/v1/user/self')
//                 .set('Authorization', authHeader);

//             expect(res.statusCode).toBe(200);
//             expect(res.body).toHaveProperty('email', 'jane.doe@example.com');
//         });

//         // Test for invalid credentials
//         it('should return 401 Unauthorized for invalid credentials', async () => {
//             const invalidAuthHeader = 'Basic ' + Buffer.from('john@example.com:wrongpassword').toString('base64');

//             const res = await request(app)
//                 .get('/v1/user/self')
//                 .set('Authorization', invalidAuthHeader);

//             expect(res.statusCode).toBe(401);
//             expect(res.body.message).toBe('Invalid email or password');
//         });

//         // Test for missing Authorization header
//         it('should return 401 Unauthorized if Authorization header is missing', async () => {
//             const res = await request(app).get('/v1/user/self');

//             expect(res.statusCode).toBe(401);
//             expect(res.body.message).toBe('Missing or invalid authorization header');
//         });
//     });

//     describe('PUT /v1/user/self', () => {
//         // Test for updating user's first name and password
//         it('should update the user’s first name and password', async () => {
//             const res = await request(app)
//                 .put('/v1/user/self')
//                 .set('Authorization', authHeader)
//                 .send({
//                     first_name: 'Janet',
//                     last_name: 'Doe',
//                     email: 'jane.doe@example.com',
//                     password: 'password123'
//                 });

//             expect(res.statusCode).toBe(204); // No Content
//         });

//         // Test for invalid fields in update
//         it('should return 400 Bad Request for invalid update fields', async () => {
//             const res = await request(app)
//                 .put('/v1/user/self')
//                 .set('Authorization', authHeader)
//                 .send({
//                     email: 'invalid@update.com' // Email shouldn't be updatable
//                 });

//             expect(res.statusCode).toBe(400);
//         });

//         // Test to ensure the update reflects in the response
//         it('should reflect the changes after update', async () => {
//             const res = await request(app)
//                 .get('/v1/user/self')
//                 .set('Authorization', authHeader);

//             expect(res.statusCode).toBe(200);
//             expect(res.body).toHaveProperty('first_name', 'Janet');
//         });
//     });

//     describe('Invalid Methods', () => {
//         // Test for invalid methods on /v1/user endpoint
//         it('should return 405 Method Not Allowed for invalid methods on /v1/user', async () => {
//             const res = await request(app).delete('/v1/user');
//             expect(res.statusCode).toBe(405);
//         });

//         // Test for invalid methods on /v1/user/self endpoint
//         it('should return 405 Method Not Allowed for invalid methods on /v1/user/self', async () => {
//             const res = await request(app).delete('/v1/user/self').set('Authorization', authHeader);
//             expect(res.statusCode).toBe(405);
//         });
//     });
// });
