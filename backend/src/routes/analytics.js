const express = require('express');
const { getUrlAnalytics } = require('../controllers/analytics');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/:id', protect, getUrlAnalytics);

module.exports = router;
