const File = require('../models/File');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const { getLocalIpAddress } = require('../utils/ip-utils');

// Expiry time config (1 hour by default)
const EXPIRY_MINUTES = parseInt(process.env.EXPIRY_MINUTES) || 60;

const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const fileId = uuidv4();
        const expiresAt = new Date(Date.now() + EXPIRY_MINUTES * 60 * 1000);

        const newFile = new File({
            fileId,
            originalName: req.file.originalname,
            fileName: req.file.filename,
            size: req.file.size,
            mimeType: req.file.mimetype,
            expiresAt
        });

        await newFile.save();

        const serverIp = getLocalIpAddress();
        const frontendPort = process.env.FRONTEND_PORT || 5173;
        
        // This is the URL that the QR code will point to
        const fileURL = `http://${serverIp}:${frontendPort}/file/${fileId}`;
        
        // Generate QR Code as base64
        const qrCode = await QRCode.toDataURL(fileURL);

        res.status(201).json({
            fileId,
            fileURL,
            qrCode,
            expiresAt
        });

    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ error: 'Server error during upload' });
    }
};

const getFileMetadata = async (req, res) => {
    try {
        const { id } = req.params;
        const file = await File.findOne({ fileId: id });

        if (!file) {
            return res.status(404).json({ error: 'File not found or expired' });
        }

        // Check if expired
        if (new Date() > file.expiresAt) {
            return res.status(410).json({ error: 'File has expired' });
        }

        res.json({
            fileId: file.fileId,
            originalName: file.originalName,
            size: file.size,
            mimeType: file.mimeType,
            downloads: file.downloads,
            expiresAt: file.expiresAt
        });

    } catch (error) {
        console.error('Get Metadata Error:', error);
        res.status(500).json({ error: 'Server error retrieving file' });
    }
};

const downloadFile = async (req, res) => {
    try {
        const { id } = req.params;
        const file = await File.findOne({ fileId: id });

        if (!file) {
            return res.status(404).json({ error: 'File not found or expired' });
        }

        if (new Date() > file.expiresAt) {
            return res.status(410).json({ error: 'File has expired' });
        }

        const filePath = path.join(__dirname, '..', 'uploads', file.fileName);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File missing from server disk' });
        }

        // Increment downloads
        file.downloads += 1;
        await file.save();

        res.download(filePath, file.originalName);

    } catch (error) {
        console.error('Download Error:', error);
        res.status(500).json({ error: 'Server error during download' });
    }
};

module.exports = {
    uploadFile,
    getFileMetadata,
    downloadFile
};
