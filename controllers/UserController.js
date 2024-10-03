const User = require("../models/user.model");
const bcrypt = require('bcrypt');

// Security headers to include in every response
const headers = {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'X-Content-Type-Options': 'nosniff',
};

// Regular expression to validate email format
const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

// Function to validate request fields for both create and update operations
const validateRequestFields = (body, res) => {
    const { first_name, last_name, password, email } = body;
    
    if (!first_name || !last_name || !password || !email) { //if (!first_name && !last_name && !password) {
        return res.status(400).header(headers).send({ message: 'Invalid Request Body: Missing required fields.' });
    }
    
    if (first_name && typeof first_name !== 'string') {
        return res.status(400).header(headers).send({ message: 'First Name must be a string.' });
    }
    
    if (last_name && typeof last_name !== 'string') {
        return res.status(400).header(headers).send({ message: 'Last Name must be a string.' });
    }
    
    if (password && (typeof password !== 'string' || password.length <= 5)) {
        return res.status(400).header(headers).send({ message: 'Password must be a string with a minimum length of 6 characters.' });
    }
    
    if (email && !emailRegex.test(email)) {
        return res.status(400).header(headers).send({ message: 'Invalid Email Format' });
    }
    
    return null; // No errors
};

// Create a new user
const createUser = async (req, res) => {
    if (req.originalUrl.includes('?')) {
        return res.status(400).header(headers).send({ message: 'Bad Request' });
    }

    const error = validateRequestFields(req.body, res);
    if (error) return error;

    try {
        const { first_name, last_name, password, email } = req.body;

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).header(headers).send({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));
        const newUser = await User.create({
            first_name,
            last_name,
            email,
            password: hashedPassword
        });

        res.status(201).header(headers).send({
            id: newUser.id,
            first_name: newUser.first_name,
            last_name: newUser.last_name,
            email: newUser.email,
            account_created: newUser.account_created,
            account_updated: newUser.account_updated
        });
    } catch (err) {
        console.error('Error during user creation:', err);
        return res.status(400).header(headers).send({ message: 'Invalid request' });
    }
};

// Update an existing user

const updateUser = async (req, res) => {
    const { first_name, last_name, password } = req.body;
    const authUser = req.authUser.email; // Using email for authentication

    // Validate fields
    const validationError = validateRequestFields(req.body, res);
    if (validationError) return validationError;

    try {
        const existingUser = await User.findOne({ where: { email: authUser } });
        if (!existingUser) {
            return res.status(404).header(headers).send({ message: 'User Not Found' });
        }

        existingUser.set({
            first_name: first_name || existingUser.first_name,
            last_name: last_name || existingUser.last_name,
            ...(password && { password: await bcrypt.hash(password, await bcrypt.genSalt(10)) })
        });
        await existingUser.save();
        return res.status(204).header(headers).send(); // No Content
    } catch (err) {
        console.error('Error updating user:', err);
        return res.status(400).header(headers).send({ message: 'Invalid request' });
    }
};

// Retrieve an existing user
const getUser = async (req, res) => {
    const requestContent = req.headers['content-length'];
    const authUser = req.authUser.email; // Using email for authentication

    if (parseInt(requestContent) > 0 || req.originalUrl.includes('?')) {
        return res.status(400).header(headers).send();
    }

    try {
        const user = await User.findOne({
            where: { email: authUser },
            attributes: { exclude: ['password'] }
        });
        if (!user) {
            return res.status(404).header(headers).send({ message: 'User not found' });
        }
        return res.status(200).header(headers).send(user);
    } catch (err) {
        console.error('Error getting user:', err);
        return res.status(400).header(headers).send({ message: 'Invalid request' });
    }
};

// Exporting the functions
module.exports = {
    createUser,
    updateUser,
    getUser
};
