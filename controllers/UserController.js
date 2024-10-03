const User = require("../models/user.model");
const bcrypt = require('bcrypt');

// Security headers to include in every response
const headers = {
    'Cache-Control': 'no-cache, no-store, must-revalidate', // Prevent caching of response
    'Pragma': 'no-cache',
    'X-Content-Type-Options': 'nosniff',
};

// Regular expression to validate email format
const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

// Function to validate request fields for both create and update operations
const validateRequestFields = (body, res) => {
    const { first_name, last_name, password, email } = body;
    
    // Check if any required field is missing from the request body
    if (!first_name || !last_name || !password || !email) { //if (!first_name && !last_name && !password) {
        return res.status(400).header(headers).send({ message: 'Invalid Request Body: Missing required fields.' });
    }
    
    // Validate that the first name is a string
    if (first_name && typeof first_name !== 'string') {
        return res.status(400).header(headers).send({ message: 'First Name must be a string.' });
    }
    
    // Validate that the last name is a string
    if (last_name && typeof last_name !== 'string') {
        return res.status(400).header(headers).send({ message: 'Last Name must be a string.' });
    }
    
    // Validate that the password is a string and at least 6 characters long
    if (password && (typeof password !== 'string' || password.length <= 5)) {
        return res.status(400).header(headers).send({ message: 'Password must be a string with atleast 6 characters.' });
    }
    
    // Validate the email format using the regular expression
    if (email && !emailRegex.test(email)) {
        return res.status(400).header(headers).send({ message: 'Invalid Email Format' });
    }
    
    return null; // No errors
};

// Create a new user
const createUser = async (req, res) => {
    // Reject if URL contains query parameters
    if (req.originalUrl.includes('?')) {
        return res.status(400).header(headers).send({ message: 'Bad Request' });
    }

    const error = validateRequestFields(req.body, res);
    if (error) return error;

    try {
        const { first_name, last_name, password, email } = req.body;

        // Check if a user with the same email already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).header(headers).send({ message: 'Email already exists' });
        }

        // Hash the password before storing it in the database
        const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));
        // Create a new user in the database
        const newUser = await User.create({
            first_name,
            last_name,
            email,
            password: hashedPassword
        });

        // Return success response with new user information (NO password)
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
        // Find the user by the authenticated user's email
        const existingUser = await User.findOne({ where: { email: authUser } });
        if (!existingUser) {
            return res.status(404).header(headers).send({ message: 'User Not Found' });
        }

        // Update user details (if a new password is provided, hash it before saving)
        existingUser.set({
            first_name: first_name || existingUser.first_name,
            last_name: last_name || existingUser.last_name,
            ...(password && { password: await bcrypt.hash(password, await bcrypt.genSalt(10)) })
        });
        await existingUser.save();
        return res.status(204).header(headers).send(); // No Content - success without response body
    } catch (err) {
        console.error('Error updating user:', err);
        return res.status(400).header(headers).send({ message: 'Invalid request' });
    }
};

// Retrieve an existing user
const getUser = async (req, res) => {
    const requestContent = req.headers['content-length'];
    const authUser = req.authUser.email; // Using email for authentication

    // Reject requests with content
    if (parseInt(requestContent) > 0 || req.originalUrl.includes('?')) {
        return res.status(400).header(headers).send();
    }

    try {
        const user = await User.findOne({
            where: { email: authUser },
            attributes: { exclude: ['password'] } // Should not be in response
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
