const Url = require('../models/Url');
const Visit = require('../models/Visit');
const { resolveIp } = require('../utils/geo');

// @desc    Redirect short code to original destination URL & track analytics
// @route   GET /:shortCode
// @access  Public
exports.handleRedirect = async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    // Look up URL database record
    const url = await Url.findOne({
      $or: [{ shortCode: shortCode }, { customAlias: shortCode.toLowerCase() }]
    });

    // If link does not exist, send visitor to frontend 404 handler
    if (!url) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/not-found`);
    }

    // Check expiration deadline
    if (url.expiresAt && new Date() > url.expiresAt) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/expired`);
    }

    // Fast atomic click count increment
    await Url.updateOne({ _id: url._id }, { $inc: { clicks: 1 } });

    // Gather client signatures
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const parsedIp = clientIp.split(',')[0].trim();
    
    const ua = req.useragent;
    const deviceType = ua.isMobile ? 'Mobile' : ua.isTablet ? 'Tablet' : 'Desktop';
    const browserName = ua.browser || 'Unknown';
    const osName = ua.os || 'Unknown';

    // Perform geolocation mapping and db insertion asynchronously
    resolveIp(parsedIp)
      .then(async (geo) => {
        await Visit.create({
          urlId: url._id,
          ip: parsedIp,
          browser: browserName,
          device: deviceType,
          os: osName,
          country: geo.country,
          city: geo.city,
        });
      })
      .catch((err) => {
        console.error(`Async visitor analytics log failed for code ${shortCode}:`, err.message);
      });

    // Send HTTP 302 Found Redirection
    return res.redirect(302, url.originalUrl);
  } catch (error) {
    next(error);
  }
};
