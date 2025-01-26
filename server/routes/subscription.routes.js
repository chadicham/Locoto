const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscription.controller');
const { protect } = require('../middleware/auth.middleware');

// Route webhook sans authentification car elle est appelée par Stripe
router.post('/webhook', express.raw({ type: 'application/json' }), subscriptionController.handleWebhook);

// Application du middleware d'authentification pour les autres routes
router.use(protect);

// Routes nécessitant une authentification
router.post('/create-session', subscriptionController.createSubscriptionSession);
router.get('/current', subscriptionController.getCurrentSubscription);

module.exports = router;