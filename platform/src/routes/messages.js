const express = require('express');
const router = express.Router();
const {
    sendMessage,
    getMessageStatus,
    listMessages,
    cancelMessage
} = require('../controllers/messages');

const authenticate = require('../middleware/auth');
const { apiLimiter, messageSendLimiter } = require('../middleware/rateLimiter');

router.use(authenticate);
router.use(apiLimiter);

router.post('/', messageSendLimiter, sendMessage);
router.get('/', listMessages);
router.get('/:id', getMessageStatus);
router.delete('/:id', cancelMessage);

module.exports = router;
