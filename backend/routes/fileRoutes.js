const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const requireSameSubnet = require('../middleware/network-restriction');
const { uploadFile, getFileMetadata, downloadFile } = require('../controllers/fileController');

// Configure Multer for local storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '..', 'uploads');
        const fs = require('fs');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + uuidv4();
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    fileFilter: (req, file, cb) => {
        // Optional: restrict file types here
        cb(null, true);
    }
});

router.post('/upload', upload.single('file'), uploadFile);

// Apply restriction ONLY here
router.get('/file/:id', requireSameSubnet, getFileMetadata);
router.get('/download/:id', requireSameSubnet, downloadFile);

// Routes
router.post('/upload', upload.single('file'), uploadFile);
router.get('/file/:id', getFileMetadata);
router.get('/download/:id', downloadFile);

module.exports = router;
