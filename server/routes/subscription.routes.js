const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscription.controller');
const { protect } = require('../middleware/auth.middleware');

// Middleware d'authentification pour toutes les routes sauf webhook
router.use(protect);

// Routes protégées
router.post('/create-session', subscriptionController.createSubscriptionSession);
router.get('/current', subscriptionController.getCurrentSubscription);
router.get('/check-session', subscriptionController.checkSession);

module.exports = router;