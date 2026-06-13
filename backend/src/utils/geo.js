const axios = require('axios');

/**
 * Resolves geolocation data (country and city) for a given IP address.
 * Employs custom fallback mocks for local environment IP loops.
 */
const resolveIp = async (ip) => {
  const cleanIp = (ip || '').replace('::ffff:', '').trim();

  // If local loopback, return random mock geo nodes to populate the analytics dashboard elegantly
  if (
    !cleanIp ||
    cleanIp === '::1' ||
    cleanIp === '127.0.0.1' ||
    cleanIp === 'localhost' ||
    cleanIp.startsWith('192.168.') ||
    cleanIp.startsWith('10.') ||
    cleanIp.startsWith('172.16.')
  ) {
    const mockNodes = [
      { country: 'India', city: 'Chennai' },
      { country: 'India', city: 'Mumbai' },
      { country: 'India', city: 'Delhi' },
      { country: 'India', city: 'Bangalore' },
      { country: 'India', city: 'Hyderabad' },
    ];
    return mockNodes[Math.floor(Math.random() * mockNodes.length)];
  }

  try {
    const res = await axios.get(`http://ip-api.com/json/${cleanIp}`, { timeout: 2000 });
    if (res.data && res.data.status === 'success') {
      return {
        country: res.data.country || 'Unknown',
        city: res.data.city || 'Unknown',
      };
    }
  } catch (error) {
    console.error(`IP Geolocation query failed for ${cleanIp}:`, error.message);
  }

  return { country: 'Unknown', city: 'Unknown' };
};

module.exports = { resolveIp };
