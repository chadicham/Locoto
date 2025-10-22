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

// Configuration CORS
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);

const corsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:5174', 
            'http://localhost:5175',
            'http://localhost:3000',
            'https://locoto.vercel.app'
        ];
        
        // Autoriser les requêtes sans origin (comme Postman) en dev
        if (!origin && process.env.NODE_ENV === 'development') {
            return callback(null, true);
        }
        
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with'],
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Configuration Helmet améliorée pour la sécurité
app.use(helmet({
    contentSecurityPolicy: false, // Désactiver en dev, configurer en prod
    crossOriginEmbedderPolicy: false,
}));

// Compression avec options optimisées
app.use(compression({
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    },
    level: 6, // Niveau de compression (0-9)
    threshold: 1024, // Compresser seulement si > 1KB
}));

// Logging conditionnel
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Route Stripe webhook avant le middleware de parsing JSON
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));

// Middlewares de parsing pour toutes les autres routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configuration des fichiers statiques avec cache
const staticOptions = {
    maxAge: process.env.NODE_ENV === 'production' ? '1y' : 0,
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
        // Cache plus agressif pour les assets statiques
        if (path.endsWith('.jpg') || path.endsWith('.png') || path.endsWith('.jpeg') || path.endsWith('.gif')) {
            res.setHeader('Cache-Control', 'public, max-age=31536000');
        }
    }
};

app.use(express.static(path.join(__dirname, 'public'), staticOptions));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), staticOptions));

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