const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Utiliser MongoDB local si MONGODB_URI n'est pas défini
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/locoto';
        
        const connection = await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('✅ Connexion à MongoDB établie avec succès');
        console.log('📍 URI:', mongoURI.replace(/\/\/.*@/, '//***:***@')); // Masquer les credentials
        return connection;
    } catch (error) {
        console.error('❌ Erreur de connexion à MongoDB:', error.message);
        console.log('💡 Assurez-vous que MongoDB est démarré ou que MONGODB_URI est défini dans .env');
        process.exit(1);
    }
};

module.exports = connectDB;