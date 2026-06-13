const express = require('express');
const { shorten, getMyLinks, updateUrl, deleteUrl, bulkShorten } = require('../controllers/url');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Apply auth protection middleware to all URL endpoints
router.use(protect);

router.post('/shorten', shorten);
router.get('/my-links', getMyLinks);
router.put('/:id', updateUrl);
router.delete('/:id', deleteUrl);
router.post('/bulk-shorten', bulkShorten);

module.exports = router;
