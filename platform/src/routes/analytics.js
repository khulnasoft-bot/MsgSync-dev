const express = require('express');
const router = express.Router();
const { getStats, getTrends } = require('../controllers/analytics');
const authenticate = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

router.use(authenticate);
router.use(apiLimiter);

router.get('/stats', getStats);
router.get('/trends', getTrends);

module.exports = router;
