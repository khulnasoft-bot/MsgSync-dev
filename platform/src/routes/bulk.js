const express = require('express');
const router = express.Router();
const {
    createList,
    addContacts,
    createCampaign,
    startCampaign
} = require('../controllers/bulk');
const authenticate = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

router.use(authenticate);
router.use(apiLimiter);

// Contact Lists
router.post('/lists', createList);
router.post('/lists/:listId/contacts', addContacts);

// Campaigns
router.post('/campaigns', createCampaign);
router.post('/campaigns/:id/start', startCampaign);

module.exports = router;
