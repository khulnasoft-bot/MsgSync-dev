const express = require('express');
const router = express.Router();
const {
    sendMessage,
    getMessageStatus,
    listMessages,
    cancelMessage
} = require('../controllers/messages');

const authenticate = require('../middleware/auth');

router.use(authenticate);

router.post('/', sendMessage);
router.get('/', listMessages);
router.get('/:id', getMessageStatus);
router.delete('/:id', cancelMessage);

module.exports = router;
