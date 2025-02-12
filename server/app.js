const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const routes = require('./routes');


console.log('Initialisation de l\'application Express...');

console.log('Variables d\'environnement chargées:', {
    SEND_CONTRACT_EMAILS: process.env.SEND_CONTRACT_EMAILS,
    EMAIL_HOST: process.env.EMAIL_HOST,
    EMAIL_PORT: process.env.EMAIL_PORT,
    EMAIL_USER: process.env.EMAIL_USER
});

const app = express();

// Configuration CORS plus permissive en développement
const corsOptions = {
    origin: process.env.NODE_ENV === 'development' 
        ? ['http://localhost:5173', 'http://localhost:3000']
        : process.env.FRONTEND_URL,
    credentials: true
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));

// Route Stripe webhook avant le middleware de parsing JSON
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));

// Middlewares de parsing pour toutes les autres routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configuration des fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

console.log('Middlewares configurés avec succès');

// Routes de l'API
app.use('/api', routes);

console.log('Routes configurées avec succès');

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