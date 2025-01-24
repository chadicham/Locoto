const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
// Ajouter au début du fichier app.js, juste après la création de l'app
console.log('Initialisation de l\'application Express...');

// Ajouter après la configuration des middlewares
console.log('Middlewares configurés avec succès');

// Ajouter après la configuration des routes
console.log('Routes configurées avec succès');
// Importation des routes
const routes = require('./routes');

// Initialisation de l'application Express
const app = express();

// Configuration des middlewares
app.use(helmet()); // Sécurité

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));

app.use(compression()); // Compression des réponses
app.use(morgan('dev')); // Logging des requêtes en mode développement

// Configuration pour la gestion des fichiers
app.use(express.static(path.join(__dirname, 'public')));

// Parsing des requêtes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configuration pour les uploads de fichiers
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware pour la gestion des fichiers bruts (pour Stripe webhooks)
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));

// Routes de l'API
app.use('/api', routes);

// Gestion des erreurs 404
app.use((req, res, next) => {
    res.status(404).json({
        error: 'Route non trouvée',
        path: req.originalUrl
    });
});

// Gestion globale des erreurs
app.use((error, req, res, next) => {
    console.error('Erreur serveur:', error);
    
    const response = {
        error: process.env.NODE_ENV === 'production' 
            ? 'Une erreur est survenue'
            : error.message
    };

    if (process.env.NODE_ENV !== 'production') {
        response.stack = error.stack;
    }

    res.status(error.status || 500).json(response);
});

module.exports = app;