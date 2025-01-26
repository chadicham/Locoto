const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { protect } = require('../middleware/auth.middleware');

// Application du middleware d'authentification
router.use(protect);

// Configuration des routes du dashboard
router.get('/statistics', dashboardController.getStatistics);
router.get('/current-rentals', dashboardController.getCurrentRentals);

module.exports = router;