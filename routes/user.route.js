const express = require('express');
const router = express.Router();
const { createUser, getUser, updateUser, verifyEmail } = require('../controllers/UserController');
const authenticate = require('../auth');

const headers = {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'X-Content-Type-Options': 'nosniff',
};

// Public route - create a new user (POST /v1/user)
router.post('/', createUser);
router.get('/verify-email', verifyEmail);

// Authenticated route - get user info (GET /v1/user/self) and update user info (PUT /v1/user/self)
router.get('/self', authenticate, getUser);
router.put('/self', authenticate, updateUser);

// Handle unsupported methods for '/v1/user'
router.all('/', (req, res) => {
    res.status(405).header(headers).send({ message: 'Method Not Allowed' });
});

// Handle unsupported methods for '/v1/user/self'
router.all('/self', (req, res) => {
    res.status(405).header(headers).send({ message: 'Method Not Allowed' });
});

module.exports = router;
