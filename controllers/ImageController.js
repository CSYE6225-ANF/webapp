const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
// const User = require("../models/user.model");
const Image = require("../models/image.model");
const logger = require('../utils/logger');
const statsdClient = require('../utils/statsd'); // Import StatsD client


// Security headers to include in every response
const headers = {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'X-Content-Type-Options': 'nosniff',
};

// AWS S3 configuration
AWS.config.update({ region: process.env.AWS_REGION || "us-east-1" });
const s3 = new AWS.S3();

const uploadImage = async (req, res) => {
    statsdClient.increment('api.uploadImage.count'); // Count API call
    const apiStart = Date.now(); // Start timing for the API call

    try {
        const start = Date.now();
        const { file } = req;

        // Validate file existence
        if (!file) {
            logger.warn('No file provided in the request.');
            // console.warn('No file provided in the request.');
            return res.status(400).header(headers).json({ message: "No file provided." });
        }

        // Validate file type
        const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];
        if (!allowedTypes.includes(file.mimetype)) {
            logger.warn('Unsupported file type provided.');
            // console.warn('Unsupported file type provided.');
            return res.status(400).header(headers).json({ message: "Unsupported file type. Only PNG, JPG, and JPEG are allowed." });
        }

        const userId = req.authUser.userId; // Assuming userId is extracted from authenticated user

        // Check if an image already exists for the user
        // const existingImage = await Image.findOne({ where: { user_id: userId } });
        // if (existingImage) {
        //     console.warn(`User ${userId} already has an uploaded image.`);
        //     return res.status(409).header(headers).json({ message: "User already has an uploaded image. Please delete the existing image before uploading a new one." });
        // }

        const imageId = uuidv4(); // Generate a unique image ID for the database record
        const bucketName = process.env.S3_BUCKET_NAME;
        const fileName = file.originalname;

        const params = {
            Bucket: bucketName,
            Key: userId, // Stores the image with the user ID as the key in S3
            Body: file.buffer,
            ContentType: file.mimetype,
        };

        // Upload image to S3
        const s3Start = Date.now(); // Start timing for S3 call
        await s3.upload(params).promise();
        statsdClient.timing('s3.upload.duration', Date.now() - s3Start); // Log S3 upload time
        // const duration = Date.now() - start;

        // Construct the URL manually
        const url = `${bucketName}/${userId}/${fileName}`;

        // Format the upload_date as "YYYY-MM-DD"
        const upload_date = new Date().toISOString().split('T')[0];

        // Save metadata to database
        const dbStart = Date.now(); // Start timing for DB query
        const image = await Image.create({
            id: imageId,
            file_name: fileName,
            url: url,
            upload_date: upload_date,
            user_id: userId,
        });
        statsdClient.timing('db.query.createImage', Date.now() - dbStart); // Log DB query time

        // logger.info(`Image uploaded successfully for user ${userId} in ${duration}ms.`);
        // console.log(`Image uploaded successfully for user ${userId} in ${duration}ms.`);
        logger.info(`Image uploaded successfully for user ${userId}.`);
        return res.status(201).header(headers).json({
            id: image.id,
            file_name: image.file_name,
            url: image.url,
            upload_date: image.upload_date,
            user_id: image.user_id,
        });
    } catch (error) {
        logger.error(`Error during image upload: ${error.message}`);
        // console.error(`Error during image upload: ${error.message}`);
        return res.status(500).header(headers).json({ message: "Error uploading image" });
    } finally {
        statsdClient.timing('api.uploadImage.duration', Date.now() - apiStart); // Log API execution time
        statsdClient.close();
    }
};

// Get profile image (GET /v1/user/self/pic)
const getImage = async (req, res) => {
    statsdClient.increment('api.getImage.count'); // Count API call
    const apiStart = Date.now(); // Start timing for the API call

    try {
        const userId = req.authUser.userId; // Assuming userId is extracted from authenticated user

        // Find the image associated with the user in the database
        const dbStart = Date.now(); // Start timing for DB query
        const image = await Image.findOne({ where: { user_id: userId } });
        if (!image) {
            logger.warn(`Profile image not found for user ${userId}.`);
            // console.warn(`Profile image not found for user ${userId}.`);
            return res.status(404).header(headers).json({ message: "Profile image not found." });
        }

        logger.info(`Profile image retrieved successfully for user ${userId}.`);
        // console.log(`Profile image retrieved successfully for user ${userId}.`);
        return res.status(200).header(headers).json({
            id: image.id,
            file_name: image.file_name,
            url: image.url,
            upload_date: image.upload_date,
            user_id: image.user_id,
        });
    } catch (error) {
        logger.error(`Error retrieving image for user: ${error.message}`);
        // console.error(`Error retrieving image for user: ${error.message}`);
        return res.status(500).header(headers).json({ message: "Error retrieving image" });
    } finally {
        statsdClient.timing('api.getImage.duration', Date.now() - apiStart); // Log API execution time
        statsdClient.close();
    }
};

// Delete profile image (DELETE /v1/user/self/pic)
const deleteImage = async (req, res) => {
    statsdClient.increment('api.deleteImage.count'); // Count API call
    const apiStart = Date.now(); // Start timing for the API call

    try {
        const userId = req.authUser.userId; // Assuming userId is extracted from authenticated user

        // Check if the image exists in the database
        const dbStart = Date.now(); // Start timing for DB query
        const image = await Image.findOne({ where: { user_id: userId } });
        statsdClient.timing('db.query.findOneImage', Date.now() - dbStart); // Log DB query time


        if (!image) {
            logger.warn(`Profile image not found for user ${userId}.`);
            // console.warn(`Profile image not found for user ${userId}.`);
            return res.status(404).header(headers).json({ message: "Profile image not found." });
        }

        // Delete the image from S3
        const s3Start = Date.now(); // Start timing for S3 call
        const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: userId // Using userId as the unique key in S3
        };
        await s3.deleteObject(params).promise();
        statsdClient.timing('s3.delete.duration', Date.now() - s3Start); // Log S3 delete time

        // Remove the image metadata from the database
        const dbDeleteStart = Date.now();
        // Remove the image metadata from the database
        await image.destroy();
        statsdClient.timing('db.query.deleteImage', Date.now() - dbDeleteStart); // Log DB delete time
        
        logger.info(`Profile image deleted successfully for user ${userId}.`);
        // console.log(`Profile image deleted successfully for user ${userId}.`);
        return res.status(204).header(headers).send(); // No Content
    } catch (error) {
        logger.error(`Error deleting image for user: ${error.message}`);
        // console.error(`Error deleting image for user: ${error.message}`);
        return res.status(500).header(headers).json({ message: "Error deleting image" });
    } finally {
        statsdClient.timing('api.deleteImage.duration', Date.now() - apiStart); // Log API execution time
        statsdClient.close();
    }
};

// Exporting the functions
module.exports = {
    uploadImage,
    getImage,
    deleteImage,
};
