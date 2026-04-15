const { getServerSubnet } = require('../utils/ip-utils');

const requireSameSubnet = (req, res, next) => {
    try {
        const clientIpRaw = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
        const clientIp = clientIpRaw.split(',')[0].trim();

        // 🔥 ADD LOG HERE
        console.log("Raw Client IP:", clientIpRaw);
        console.log("Processed Client IP:", clientIp);

        // Handle local host variations
        if (
            clientIp === '::1' ||
            clientIp === '127.0.0.1' ||
            clientIp.includes('::ffff:127.0.0.1')
        ) {
            console.log("Localhost access allowed"); // 🔥 ADD
            return next();
        }

        const serverSubnet = getServerSubnet();

        // 🔥 ADD LOG HERE
        console.log("Server Subnet:", serverSubnet);

        if (!serverSubnet) {
            console.warn('Could not determine server subnet. Allowing connection.');
            return next();
        }

        // Clean IPv6 mapped IPv4
        let cleanClientIp = clientIp;
        if (cleanClientIp && cleanClientIp.includes('::ffff:')) {
            cleanClientIp = cleanClientIp.split('::ffff:')[1];
        }

        // 🔥 ADD LOG HERE
        console.log("Clean Client IP:", cleanClientIp);

        const clientParts = cleanClientIp ? cleanClientIp.split('.') : [];

        if (clientParts.length === 4) {
            const clientSubnet = `${clientParts[0]}.${clientParts[1]}.${clientParts[2]}`;

            // 🔥 ADD LOG HERE
            console.log("Client Subnet:", clientSubnet);

            if (clientSubnet === serverSubnet) {
                console.log("✅ Same network — access granted"); // 🔥
                return next();
            }
        }

        console.log(`[BLOCKED] External access attempt from IP: ${clientIp}`);
        return res.status(403).json({
            error: 'Access denied. You must be on the same local network as the server.'
        });

    } catch (error) {
        console.error('Error in network restriction middleware:', error);
        return res.status(500).json({ error: 'Internal server error validating network.' });
    }
};

module.exports = requireSameSubnet;
