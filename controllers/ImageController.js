// Import AWS SDK v3 clients and commands
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require("uuid");
const Image = require("../models/image.model");
const logger = require('../utils/logger');
const statsdClient = require('../utils/statsd'); // Import StatsD client

// Security headers to include in every response
const headers = {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'X-Content-Type-Options': 'nosniff',
};

// Initialize S3 Client with AWS SDK v3
const s3Client = new S3Client({ region: process.env.AWS_REGION || "us-east-1" });

// Upload Image Function
const uploadImage = async (req, res) => {
    statsdClient.increment('api.uploadImage.count'); // Count API call
    const apiStart = Date.now(); // Start timing for the API call

    try {
        const start = Date.now();
        const { file } = req;

        // Validate file existence
        if (!file) {
            logger.warn('No file provided in the request.');
            return res.status(400).header(headers).json({ message: "No file provided." });
        }

        // Validate file type
        const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];
        if (!allowedTypes.includes(file.mimetype)) {
            logger.warn('Unsupported file type provided.');
            return res.status(400).header(headers).json({ message: "Unsupported file type. Only PNG, JPG, and JPEG are allowed." });
        }

        const userId = req.authUser.userId;
        const imageId = uuidv4();
        const bucketName = process.env.S3_BUCKET_NAME;
        const fileName = file.originalname;

        // Set S3 upload parameters
        const params = {
            Bucket: bucketName,
            Key: userId, // Use userId as the key in S3
            Body: file.buffer,
            ContentType: file.mimetype,
        };

        // Upload image to S3 using AWS SDK v3
        const s3Start = Date.now();
        const command = new PutObjectCommand(params);
        await s3Client.send(command);
        statsdClient.timing('s3.upload.duration', Date.now() - s3Start);

        // Construct the URL manually
        const url = `${bucketName}/${userId}/${fileName}`;

        const upload_date = new Date().toISOString().split('T')[0];

        // Save metadata to the database
        const dbStart = Date.now();
        const image = await Image.create({
            id: imageId,
            file_name: fileName,
            url: url,
            upload_date: upload_date,
            user_id: userId,
        });
        statsdClient.timing('db.query.createImage', Date.now() - dbStart);

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
        return res.status(500).header(headers).json({ message: "Error uploading image" });
    } finally {
        statsdClient.timing('api.uploadImage.duration', Date.now() - apiStart);
        statsdClient.close();
    }
};

// Get Profile Image Function
const getImage = async (req, res) => {
    statsdClient.increment('api.getImage.count');
    const apiStart = Date.now();

    try {
        const userId = req.authUser.userId;

        // Find the image in the database
        const dbStart = Date.now();
        const image = await Image.findOne({ where: { user_id: userId } });
        statsdClient.timing('db.query.findOneImage', Date.now() - dbStart);

        if (!image) {
            logger.warn(`Profile image not found for user ${userId}.`);
            return res.status(404).header(headers).json({ message: "Profile image not found." });
        }

        logger.info(`Profile image retrieved successfully for user ${userId}.`);
        return res.status(200).header(headers).json({
            id: image.id,
            file_name: image.file_name,
            url: image.url,
            upload_date: image.upload_date,
            user_id: image.user_id,
        });
    } catch (error) {
        logger.error(`Error retrieving image for user: ${error.message}`);
        return res.status(500).header(headers).json({ message: "Error retrieving image" });
    } finally {
        statsdClient.timing('api.getImage.duration', Date.now() - apiStart);
        statsdClient.close();
    }
};

// Delete Profile Image Function
const deleteImage = async (req, res) => {
    statsdClient.increment('api.deleteImage.count');
    const apiStart = Date.now();

    try {
        const userId = req.authUser.userId;

        // Find the image in the database
        const dbStart = Date.now();
        const image = await Image.findOne({ where: { user_id: userId } });
        statsdClient.timing('db.query.findOneImage', Date.now() - dbStart);

        if (!image) {
            logger.warn(`Profile image not found for user ${userId}.`);
            return res.status(404).header(headers).json({ message: "Profile image not found." });
        }

        // Delete the image from S3
        const s3Start = Date.now();
        const deleteParams = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: userId,
        };
        const deleteCommand = new DeleteObjectCommand(deleteParams);
        await s3Client.send(deleteCommand);
        statsdClient.timing('s3.delete.duration', Date.now() - s3Start);

        // Delete image metadata from the database
        const dbDeleteStart = Date.now();
        await image.destroy();
        statsdClient.timing('db.query.deleteImage', Date.now() - dbDeleteStart);

        logger.info(`Profile image deleted successfully for user ${userId}.`);
        return res.status(204).header(headers).send();
    } catch (error) {
        logger.error(`Error deleting image for user: ${error.message}`);
        return res.status(500).header(headers).json({ message: "Error deleting image" });
    } finally {
        statsdClient.timing('api.deleteImage.duration', Date.now() - apiStart);
        statsdClient.close();
    }
};

module.exports = {
    uploadImage,
    getImage,
    deleteImage,
};
