const express = require('express');
const router = express.Router();

// Import des différentes routes
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const vehicleRoutes = require('./vehicle.routes');
const contractRoutes = require('./contract.routes');
const dashboardRoutes = require('./dashboard.routes');
const subscriptionRoutes = require('./subscription.routes');
const googleAuthRoutes = require('./googleAuth.routes.js');

console.log('Configuration des routes...');

// Configuration des routes principales de l'API avec le middleware de logging pour Google Auth
router.use('/auth/google', (req, res, next) => {
    console.log('Route Google Auth accédée:', req.method, req.path);
    next();
}, googleAuthRoutes);

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/contracts', contractRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/subscriptions', subscriptionRoutes);

// Route de test pour vérifier que l'API fonctionne
router.get('/health', (req, res) => {
    res.json({
        status: 'success',
        message: 'API Locoto opérationnelle',
        timestamp: new Date()
    });
});

// Gestion des routes non trouvées
router.all('*', (req, res) => {
    res.status(404).json({
        error: 'Route non trouvée',
        path: req.originalUrl
    });
});

// Middleware de gestion globale des erreurs
router.use((error, req, res, next) => {
    const statusCode = error.statusCode || 500;
    const status = error.status || 'error';
    
    res.status(statusCode).json({
        status,
        message: error.message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
});

module.exports = router;