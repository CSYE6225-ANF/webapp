const uuid = require('uuid');
const User = require("../models/user.model");
const bcrypt = require('bcrypt');
const logger = require('../utils/logger');
const statsdClient = require('../utils/statsd');
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
const snsClient = new SNSClient({ region: 'us-east-1' }); // Replace 'your-region' with actual region
const topicArn = process.env.SNS_TOPIC_ARN; // Make sure SNS_TOPIC_ARN is in .env

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
    statsdClient.increment('api.createUser.count'); // Count API call
    const startTime = Date.now(); // Start timing for the API call

    // Reject if URL contains query parameters
    if (req.originalUrl.includes('?')) {
        return res.status(400).header(headers).send({ message: 'Bad Request' });
    }

    const error = validateRequestFields(req.body, res);
    if (error) return error;

    try {
        const { first_name, last_name, password, email } = req.body;

        const existingUserStartTime = Date.now(); // Start timing for DB query
        // Check if a user with the same email already exists
        const existingUser = await User.findOne({ where: { email } });
        statsdClient.timing('db.query.findOne', Date.now() - existingUserStartTime); // Log DB query time

        if (existingUser) {
            logger.warn(`User creation failed: Email ${email} already exists.`);
            return res.status(409).header(headers).send({ message: 'Email already exists' });
        }

        // Hash the password before storing it in the database
        const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));
        const newUserStartTime = Date.now();
        const verificationToken = uuid.v4(); // Generate unique token
        const verificationTokenExpires = new Date(Date.now() + 2 * 60 * 1000); // 2-minute expiration

        // Create a new user in the database
        const newUser = await User.create({
            first_name,
            last_name,
            email,
            password: hashedPassword,
            verification_token: verificationToken,
            verification_token_expires: verificationTokenExpires
        });
        statsdClient.timing('db.query.create', Date.now() - newUserStartTime); // Log DB query time

        // Publish to SNS for email verification
        const messagePayload = JSON.stringify({
            firstName: first_name,
            lastName: last_name,
            email: email,
            verification_token: verificationToken,
            verification_token_expires: verificationTokenExpires,
        });

        const publishParams = {
            Message: messagePayload,
            TopicArn: topicArn,
        };

        try {
            await snsClient.send(new PublishCommand(publishParams));
            logger.info(`SNS message published for user: ${email}`);
        } catch (snsError) {
            logger.error(`Failed to publish SNS message: ${snsError.message}`);
        }

        // Return success response with new user information (NO password)
        logger.info(`User created successfully.`);
        res.status(201).header(headers).send({
            id: newUser.id,
            first_name: newUser.first_name,
            last_name: newUser.last_name,
            email: newUser.email,
            account_created: newUser.account_created,
            account_updated: newUser.account_updated
        });
    } catch (err) {
        logger.error(`Error during user creation: ${err.message}`);
        // console.error('Error during user creation:', err);
        return res.status(400).header(headers).send({ message: 'Invalid request' });
    } finally {
        statsdClient.timing('api.createUser.duration', Date.now() - startTime); // Log API execution time
    }
};

// Update an existing user
const updateUser = async (req, res) => {
    statsdClient.increment('api.updateUser.count'); // Count API call
    const startTime = Date.now(); // Start timing for the API call
    const { first_name, last_name, password } = req.body;
    const authUser = req.authUser.email; // Using email for authentication

    // Validate fields
    const validationError = validateRequestFields(req.body, res);
    if (validationError) return validationError;

    try {
        const findUserStartTime = Date.now(); // Start timing for DB query
        // Find the user by the authenticated user's email
        const existingUser = await User.findOne({ where: { email: authUser } });
        statsdClient.timing('db.query.findOne', Date.now() - findUserStartTime); // Log DB query time
        if (!existingUser) {
            logger.warn(`Update failed: User with email ${authUser} not found.`);
            return res.status(404).header(headers).send({ message: 'User Not Found' });
        }

        // Check if the user has verified their email
        if (!existingUser.email_verified) {
            logger.warn(`Email verification required`);
            return res.status(403).header(headers).send({ message: 'Email verification required' });
        }

        // Update user details (if a new password is provided, hash it before saving)
        existingUser.set({
            first_name: first_name || existingUser.first_name,
            last_name: last_name || existingUser.last_name,
            ...(password && { password: await bcrypt.hash(password, await bcrypt.genSalt(10)) })
        });

        const saveUserStartTime = Date.now();
        await existingUser.save();
        statsdClient.timing('db.query.save', Date.now() - saveUserStartTime); // Log DB query time

        logger.info(`User updated successfully: ${authUser}`);
        return res.status(204).header(headers).send(); // No Content - success without response body
    } catch (err) {
        logger.error(`Error updating user ${authUser}: ${err.message}`);
        // console.error('Error updating user:', err);
        return res.status(400).header(headers).send({ message: 'Invalid request' });
    } finally {
        statsdClient.timing('api.updateUser.duration', Date.now() - startTime); // Log API execution time
    }
};

// Retrieve an existing user
const getUser = async (req, res) => {
    statsdClient.increment('api.getUser.count'); // Count API call
    const startTime = Date.now(); // Start timing for the API call
    const requestContent = req.headers['content-length'];
    const authUser = req.authUser.email; // Using email for authentication

    // Reject requests with content
    if (parseInt(requestContent) > 0 || req.originalUrl.includes('?')) {
        logger.warn(`Invalid request: GET requests should not have content or query parameters.`);
        return res.status(400).header(headers).send({ message: "Invalid request: GET requests should not have content or query parameters." });
    }

    try {
        const findUserStartTime = Date.now(); // Start timing for DB query
        const user = await User.findOne({
            where: { email: authUser },
            attributes: { exclude: ['password'] } // Should not be in response
        });
        statsdClient.timing('db.query.findOne', Date.now() - findUserStartTime); // Log DB query time

        if (!user) {
            logger.warn(`User retrieval failed: User with email ${authUser} not found.`);
            return res.status(404).header(headers).send({ message: 'User not found' });
        }

        // Check if the user has verified their email
        if (!user.email_verified) {
            logger.warn(`Email verification required`);
            return res.status(403).header(headers).send({ message: 'Email verification required' });
        }

        logger.info(`User retrieved successfully: ${authUser}`);
        return res.status(200).header(headers).send(user);
    } catch (err) {
        logger.error(`Error getting user ${authUser}: ${err.message}`);
        // console.error('Error getting user:', err);
        return res.status(400).header(headers).send({ message: 'Invalid request' });
    } finally {
        statsdClient.timing('api.getUser.duration', Date.now() - startTime); // Log API execution time
    }
};

const verifyEmail = async (req, res) => {
    // Extract the token from the query parameter
    const token = req.query.token;

    // Check if the token is provided; if not, log an error and return a 400 response
    if (!token) {
        logger.error(`Token is missing from API request: ${req.originalUrl}`);
        return res.status(400).json({ message: "Verification token is required" });
    }

    try {
        // Look up the user in the database using the provided token
        const user = await User.findOne({
            where: {
                verification_token: token
            }
        });

        // If no user is found or the token does not match, log a warning and return a 400 response
        if (!user) {
            logger.warn('User not found or token does not match');
            return res.status(400).json({ message: "Verification link is invalid." });
        }

        // Check if the token has expired by comparing the current time with the token's expiration
        if (new Date() > user.verification_token_expires) {
            logger.warn('Verification Link Expired');
            return res.status(400).json({ message: "Verification link has expired." });
        }

        // Mark the user's email as verified and clear the verification token and expiration fields
        user.email_verified = true;
        user.verification_token = null;
        user.verification_token_expires = null;

        // // Save the updated user record to the database
        // await user.save();

        // // Log the successful verification and return a 200 response with a success message
        // logger.info(`Email Verified for Username: ${user.email}`);
        // return res.status(200).json({ message: "Your email has been successfully verified" });
        try {
            // Save the updated user record to the database
            await user.save();
            // Log the successful verification using user.email or user.first_name
            logger.info(`Email verified for user: ${user.email}`);
            return res.status(200).json({ message: "Your email has been successfully verified" });
        } catch (saveError) {
            // Handle errors specific to saving the user
            logger.error(`Failed to save user verification status for ${user.email}: ${saveError.message}`);
            return res.status(500).json({ message: "Failed to update verification status" });
        }
    } catch (err) {
        // Log any errors that occur during the verification process and return a 500 response
        logger.error(`Email Verification Failed: ${err.message}`);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Exporting the functions
module.exports = {
    createUser,
    updateUser,
    getUser,
    verifyEmail
};
