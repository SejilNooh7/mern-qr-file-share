const os = require('os');
const ip = require('ip');

function getLocalIpAddress() {
    // We can use the 'ip' package which handles this beautifully
    return ip.address();
}

function getServerSubnet() {
    const localIp = ip.address();
    // Assuming standard /24 subnet for local networks
    const parts = localIp.split('.');
    if (parts.length === 4) {
        return `${parts[0]}.${parts[1]}.${parts[2]}`;
    }
    return null;
}

module.exports = {
    getLocalIpAddress,
    getServerSubnet
};
