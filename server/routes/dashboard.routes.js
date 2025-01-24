const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const auth = require('../middleware/auth.middleware');

router.get('/statistics', auth, dashboardController.getStatistics);
router.get('/current-rentals', auth, dashboardController.getCurrentRentals);

module.exports = router;