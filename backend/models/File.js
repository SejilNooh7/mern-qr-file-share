const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    fileId: {
        type: String,
        required: true,
        unique: true
    },
    originalName: {
        type: String,
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
    downloads: {
        type: Number,
        default: 0
    },
    expiresAt: {
        type: Date,
        required: true
    }
}, { timestamps: true });

// Optional: Automatically remove from DB via TTL index
// Note: we also have a cron job to remove from disk, so we 
// set this slightly after the cron job to let the cron job do both disk and db removal if possible,
// but the TTL index is a good backup to keep db clean.
fileSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('File', fileSchema);
