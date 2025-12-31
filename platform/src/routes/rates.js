const express = require('express');
const router = express.Router();
const ratesController = require('../controllers/rates');

router.get('/rates', ratesController.listRates);
router.post('/rates', ratesController.updateRate);
router.get('/lookup', ratesController.lookupExchange);
router.post('/sender-id', ratesController.requestSenderId);
router.get('/sender-id/:orgId', ratesController.getSenderIds);
router.patch('/sender-id/:id/approve', ratesController.approveSenderId);

module.exports = router;
