const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const Image = require("../models/image.model");
// const logger = require('../utils/logger');

// Security headers to include in every response
const headers = {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'X-Content-Type-Options': 'nosniff',
};

// AWS S3 configuration
AWS.config.update({ region: process.env.AWS_REGION || "us-west-2" });
const s3 = new AWS.S3();

// Upload an image (POST /v1/user/self/pic)
const uploadImage = async (req, res) => {
    try {
        const start = Date.now();
        const { file } = req;

        // Validate file existence
        if (!file) {
            // logger.warn('No file provided in the request.');
            return res.status(400).header(headers).json({ message: "No file provided." });
        }

        // Validate file type
        const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];
        if (!allowedTypes.includes(file.mimetype)) {
            // logger.warn('Unsupported file type provided.');
            return res.status(400).header(headers).json({ message: "Unsupported file type. Only PNG, JPG, and JPEG are allowed." });
        }

        const { userId } = req.authUser; // Assuming userId is extracted from authenticated user
        const imageId = uuidv4();
        const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: `${userId}/${imageId}-${file.originalname}`,
            Body: file.buffer,
            ContentType: file.mimetype,
        };

        // Upload image to S3
        const uploadResult = await s3.upload(params).promise();
        const duration = Date.now() - start;

        // Construct the URL in the desired format: "<S3 bucket name>/<userId>/<file_name>"
        const url = `${params.Bucket}/${userId}/${file.originalname}`;

        // Format the upload_date as "YYYY-MM-DD"
        const upload_date = new Date().toISOString().split('T')[0];

        // Save metadata to database
        const image = await Image.create({
            id: imageId,
            file_name: file.originalname,
            url: url,
            upload_date: upload_date,
            user_id: userId,
        });

        // logger.info(`Image uploaded successfully for user ${userId} in ${duration}ms.`);
        return res.status(201).header(headers).json({
            id: image.id,
            file_name: image.file_name,
            url: image.url,
            upload_date: image.upload_date,
            user_id: image.user_id,
        });
    } catch (error) {
        // logger.error(`Error during image upload: ${error.message}`);
        return res.status(500).header(headers).json({ message: "Error uploading image" });
    }
};

// Get profile image (GET /v1/user/self/pic)
const getImage = async (req, res) => {
    try {
        const { userId } = req.authUser;

        const image = await Image.findOne({ where: { user_id: userId } });
        if (!image) {
            // logger.warn(`Profile image not found for user ${userId}.`);
            return res.status(404).header(headers).json({ message: "Profile image not found." });
        }

        // logger.info(`Profile image retrieved successfully for user ${userId}.`);
        return res.status(200).header(headers).json({
            id: image.id,
            file_name: image.file_name,
            url: image.url,
            upload_date: image.upload_date,
            user_id: image.user_id,
        });
    } catch (error) {
        // logger.error(`Error retrieving image for user: ${error.message}`);
        return res.status(500).header(headers).json({ message: "Error retrieving image" });
    }
};

// Delete profile image (DELETE /v1/user/self/pic)
const deleteImage = async (req, res) => {
    try {
        const { userId } = req.authUser;

        const image = await Image.findOne({ where: { user_id: userId } });
        if (!image) {
            // logger.warn(`Profile image not found for user ${userId}.`);
            return res.status(404).header(headers).json({ message: "Profile image not found." });
        }

        // Delete image from S3
        await s3.deleteObject({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: `${userId}/${image.id}-${image.file_name}`,
        }).promise();

        // Remove the image metadata from the database
        await image.destroy();
        
        // logger.info(`Profile image deleted successfully for user ${userId}.`);
        return res.status(204).header(headers).send(); // No Content
    } catch (error) {
        // logger.error(`Error deleting image for user: ${error.message}`);
        return res.status(500).header(headers).json({ message: "Error deleting image" });
    }
};

// Exporting the functions
module.exports = {
    uploadImage,
    getImage,
    deleteImage,
};
