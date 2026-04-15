const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const connectDB = require('./config/db');
const fileRoutes = require('./routes/fileRoutes');
const File = require('./models/File');
const { getLocalIpAddress } = require('./utils/ip-utils');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', fileRoutes);

// Health check and IP display endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', localIp: getLocalIpAddress() });
});

// Auto Expiry Cron Job (Runs every minute)
cron.schedule('* * * * *', async () => {
    try {
        console.log('[CRON] Running file expiry check...');
        const expiredFiles = await File.find({ expiresAt: { $lt: new Date() } });

        for (const file of expiredFiles) {
            // Delete from disk
            const filePath = path.join(__dirname, 'uploads', file.fileName);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`[CRON] Deleted file from disk: ${file.fileName}`);
            }

            // Delete from DB
            await File.findByIdAndDelete(file._id);
            console.log(`[CRON] Deleted file from DB: ${file.fileId}`);
        }
    } catch (error) {
        console.error('[CRON] Error during cleanup:', error);
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    const localIp = getLocalIpAddress();
    console.log(`\n========================================`);
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Local Network Access: http://${localIp}:${PORT}`);
    console.log(`========================================\n`);
});
