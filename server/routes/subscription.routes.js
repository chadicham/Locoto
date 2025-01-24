const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscription.controller');
const auth = require('../middleware/auth.middleware');

router.post('/create-session', auth, subscriptionController.createSubscriptionSession);
router.get('/current', auth, subscriptionController.getCurrentSubscription);
router.post('/webhook', express.raw({ type: 'application/json' }), subscriptionController.handleWebhook);

module.exports = router;