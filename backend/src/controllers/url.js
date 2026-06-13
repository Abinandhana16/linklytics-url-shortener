const Url = require('../models/Url');
const { nanoid } = require('nanoid');

// Helper to validate url
const isValidUrl = (urlStr) => {
  try {
    const url = new URL(urlStr);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (err) {
    return false;
  }
};

// @desc    Create shortened URL
// @route   POST /api/url/shorten
// @access  Private
exports.shorten = async (req, res, next) => {
  try {
    const { originalUrl, customAlias, expiresAt } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ success: false, message: 'Please provide original URL' });
    }

    // Format check & clean protocol prefix
    let cleanUrl = originalUrl.trim();
    if (!/^https?:\/\//i.test(cleanUrl)) {
      cleanUrl = `https://${cleanUrl}`;
    }

    if (!isValidUrl(cleanUrl)) {
      return res.status(400).json({ success: false, message: 'Invalid URL format' });
    }

    let code;
    if (customAlias) {
      const alias = customAlias.trim().toLowerCase();
      // Validate alias format (alphanumeric, dashes, underscores)
      if (!/^[a-z0-9-_]+$/i.test(alias)) {
        return res.status(400).json({ success: false, message: 'Custom alias must only contain letters, numbers, hyphens, and underscores' });
      }

      // Check if alias is already taken
      const aliasTaken = await Url.findOne({
        $or: [{ shortCode: alias }, { customAlias: alias }]
      });
      if (aliasTaken) {
        return res.status(409).json({ success: false, message: 'Custom alias already in use' });
      }
      code = alias;
    } else {
      // Loop to ensure uniqueness of auto code
      let codeExists = true;
      while (codeExists) {
        code = nanoid(6);
        const exists = await Url.findOne({ shortCode: code });
        if (!exists) {
          codeExists = false;
        }
      }
    }

    const newUrl = await Url.create({
      userId: req.user.id,
      originalUrl: cleanUrl,
      shortCode: code,
      customAlias: customAlias ? customAlias.trim().toLowerCase() : undefined,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    });

    res.status(201).json({
      success: true,
      data: newUrl,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's shortened links
// @route   GET /api/url/my-links
// @access  Private
exports.getMyLinks = async (req, res, next) => {
  try {
    const urls = await Url.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: urls,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update destination URL
// @route   PUT /api/url/:id
// @access  Private
exports.updateUrl = async (req, res, next) => {
  try {
    const { originalUrl } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ success: false, message: 'Please provide original URL' });
    }

    let cleanUrl = originalUrl.trim();
    if (!/^https?:\/\//i.test(cleanUrl)) {
      cleanUrl = `https://${cleanUrl}`;
    }

    if (!isValidUrl(cleanUrl)) {
      return res.status(400).json({ success: false, message: 'Invalid URL format' });
    }

    const url = await Url.findById(req.params.id);

    if (!url) {
      return res.status(404).json({ success: false, message: 'Link not found' });
    }

    // Verify ownership
    if (url.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this link' });
    }

    url.originalUrl = cleanUrl;
    await url.save();

    res.status(200).json({
      success: true,
      data: url,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete shortened URL
// @route   DELETE /api/url/:id
// @access  Private
exports.deleteUrl = async (req, res, next) => {
  try {
    const url = await Url.findById(req.params.id);

    if (!url) {
      return res.status(404).json({ success: false, message: 'Link not found' });
    }

    // Verify ownership
    if (url.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this link' });
    }

    // Delete associated visits logs as well (Cascaded delete)
    const Visit = require('../models/Visit');
    await Visit.deleteMany({ urlId: url._id });
    
    // Delete the URL doc itself
    await url.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Link and associated analytics deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk shorten URLs via request body list or raw csv text
// @route   POST /api/url/bulk-shorten
// @access  Private
exports.bulkShorten = async (req, res, next) => {
  try {
    const { urls, csvContent } = req.body;
    let urlList = [];

    // Parse array if provided
    if (Array.isArray(urls)) {
      urlList = urls;
    } else if (csvContent && typeof csvContent === 'string') {
      // Parse CSV contents manually to avoid complex multer streams, supporting simple comma/newline format
      urlList = csvContent
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .map((line) => {
          // If CSV contains 'name,url' or just 'url'
          const cols = line.split(',');
          return cols[cols.length - 1].trim(); // Get the last column or only column
        });
    } else {
      return res.status(400).json({ success: false, message: 'Provide a list of urls in the body or csvContent text' });
    }

    if (urlList.length === 0) {
      return res.status(400).json({ success: false, message: 'No URLs parsed to shorten' });
    }

    const results = [];
    const errors = [];

    for (const rawUrl of urlList) {
      let cleanUrl = rawUrl.trim();
      if (!cleanUrl) continue;

      if (!/^https?:\/\//i.test(cleanUrl)) {
        cleanUrl = `https://${cleanUrl}`;
      }

      if (!isValidUrl(cleanUrl)) {
        errors.push({ url: rawUrl, reason: 'Invalid URL format' });
        continue;
      }

      // Generate code
      let code;
      let codeExists = true;
      while (codeExists) {
        code = nanoid(6);
        const exists = await Url.findOne({ shortCode: code });
        if (!exists) {
          codeExists = false;
        }
      }

      try {
        const created = await Url.create({
          userId: req.user.id,
          originalUrl: cleanUrl,
          shortCode: code,
        });
        results.push(created);
      } catch (err) {
        errors.push({ url: rawUrl, reason: err.message });
      }
    }

    res.status(201).json({
      success: true,
      data: results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    next(error);
  }
};
