require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user.model');

async function checkUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connecté à MongoDB');

        const users = await User.find({}).select('email firstName lastName subscription createdAt');
        
        console.log('\n📊 Utilisateurs dans la base de données:');
        console.log('=====================================');
        
        if (users.length === 0) {
            console.log('❌ Aucun utilisateur trouvé dans la base de données');
            console.log('\n💡 Vous devez créer un nouveau compte via l\'inscription');
        } else {
            console.log(`✅ ${users.length} utilisateur(s) trouvé(s):\n`);
            users.forEach((user, index) => {
                console.log(`${index + 1}. Email: ${user.email}`);
                console.log(`   Nom: ${user.firstName} ${user.lastName}`);
                console.log(`   Abonnement: ${user.subscription?.plan || 'Aucun'}`);
                console.log(`   Créé le: ${user.createdAt}`);
                console.log('---');
            });
        }

        await mongoose.connection.close();
        console.log('\n✅ Connexion fermée');
    } catch (error) {
        console.error('❌ Erreur:', error.message);
        process.exit(1);
    }
}

checkUsers();
