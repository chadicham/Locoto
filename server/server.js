require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');
const mongoose = require('mongoose');

// Connexion à la base de données
connectDB();

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log('=================================');
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`📱 Mode: ${process.env.NODE_ENV}`);
    console.log(`🌐 URL Frontend: ${process.env.FRONTEND_URL}`);
    console.log('=================================');
});

// Gestion des erreurs non capturées dans le processus
process.on('uncaughtException', (error) => {
    console.error('❌ Erreur non capturée:', error);
    console.error('Stack trace:', error.stack);
    gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Gestion des promesses rejetées non gérées
process.on('unhandledRejection', (error) => {
    console.error('❌ Promesse rejetée non gérée:', error);
    console.error('Stack trace:', error.stack);
    gracefulShutdown('UNHANDLED_REJECTION');
});

// Gestion des signaux de terminaison
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

async function gracefulShutdown(signal) {
    console.log(`\n📥 Signal reçu: ${signal}`);
    console.log('🔄 Début de l\'arrêt gracieux du serveur...');
    
    try {
        await server.close();
        console.log('✅ Serveur HTTP arrêté avec succès');
        
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
            console.log('✅ Connexion à la base de données fermée avec succès');
        }
        
        console.log('👋 Arrêt complet du serveur effectué');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur lors de l\'arrêt du serveur:', error);
        process.exit(1);
    }
}