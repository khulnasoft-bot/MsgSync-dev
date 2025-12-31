const express = require('express');
const router = express.Router();
const lookupController = require('../controllers/lookups');

router.get('/info', lookupController.getLookup);
router.get('/recent', lookupController.listRecent);

module.exports = router;
