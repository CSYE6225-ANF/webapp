const bcrypt = require('bcrypt');
const User = require('./models/user.model');

// Helper function to decode the Base64 authorization header
const decodeAuthHeader = (authHeader) => {
    const base64Credentials = authHeader.split(" ")[1]; // Extract Base64 part
    const decodedCredentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    return decodedCredentials.split(":");
};

// Helper function to validate the Authorization header
const validateAuthHeader = (authHeader) => {
    if (!authHeader || !authHeader.startsWith("Basic ")) {
        throw new Error("Missing or invalid authorization header");
    }
};

// Authentication middleware
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // Validate Authorization header format
        validateAuthHeader(authHeader);

        // Decode and split the credentials
        const [email, password] = decodeAuthHeader(authHeader);

        // Ensure both email and password are provided
        if (!email || !password) {
            return res.status(401).json({
                message: "Invalid authentication format"
            });
        }

        // Look up user by email
        const user = await User.findOne({ where: { email } });

        // Validate user and compare passwords
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Attach user information to request object
        req.authUser = {
            userId: user.id,
            email: user.email
        };

        // Proceed to next middleware
        next();
    } catch (error) {
        console.error("Error in authentication middleware:", error.message);
        const status = error.message.includes("authorization header") ? 401 : 500; //Unauthorized : Internal Error
        return res.status(status).json({ message: error.message });
    }
};

module.exports = authenticate;
