const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

router.get('/sso/:provider', authController.ssoLogin);
router.get('/sso/:provider/callback', authController.ssoLogin);
router.get('/me', authController.getCurrentUser);

module.exports = router;
