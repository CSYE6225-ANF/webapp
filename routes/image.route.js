const express = require('express');
const router = express.Router();
const { uploadImage, getImage, deleteImage } = require('../controllers/ImageController');
const authenticate = require('../auth');
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() }); // Initialize multer for handling multipart/form-data

const headers = {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'X-Content-Type-Options': 'nosniff',
};


// Authenticated route - upload user image (POST /v1/user/self/pic), get user image (GET /v1/user/self/pic) and delete user image (DELETE /v1/user/self/pic)
router.post("/self/pic", authenticate, upload.single('file'), uploadImage);
router.get("/self/pic", authenticate, getImage);
router.delete("/self/pic", authenticate, deleteImage);

// Handle unsupported methods for '/v1/user/self/pic'
router.all('/self/pic', (req, res) => {
    res.status(405).header(headers).send({ message: 'Method Not Allowed' });
});

module.exports = router;
