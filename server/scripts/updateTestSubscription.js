const mongoose = require('mongoose');
const User = require('../models/user.model');
require('dotenv').config();

async function updateTestSubscription() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://test-locoto:locotopw1@clusterlocoto.hxsvu.mongodb.net/locoto');
    console.log('✅ Connecté à MongoDB');

    // Mettre à jour un utilisateur test avec un abonnement pro
    const testEmail = 'chadi__14@hotmail.com';
    
    const user = await User.findOne({ email: testEmail });
    
    if (!user) {
      console.log('❌ Utilisateur non trouvé');
      process.exit(1);
    }

    console.log('📧 Utilisateur trouvé:', user.email);
    console.log('📦 Abonnement actuel:', user.subscription);

    // Mettre à jour l'abonnement
    user.subscription.plan = 'pro';
    user.subscription.subscriptionStatus = 'active';
    user.subscription.stripeSubscriptionId = 'sub_test_' + Date.now();
    user.subscription.vehicleLimit = 10;
    user.subscription.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 jours

    await user.save();

    console.log('✅ Abonnement mis à jour:');
    console.log(JSON.stringify(user.subscription, null, 2));

    // Créer quelques autres utilisateurs avec différents plans
    const updates = [
      { email: 'e.tourvieille@gmail.com', plan: 'starter' },
      { email: 'nam@test.com', plan: 'business' },
      { email: 'hash@test.com', plan: 'unlimited' }
    ];

    for (const update of updates) {
      const u = await User.findOne({ email: update.email });
      if (u) {
        const vehicleLimits = {
          'starter': 3,
          'pro': 10,
          'business': 25,
          'unlimited': 999999
        };
        
        u.subscription.plan = update.plan;
        u.subscription.subscriptionStatus = 'active';
        u.subscription.stripeSubscriptionId = 'sub_test_' + Date.now() + '_' + update.plan;
        u.subscription.vehicleLimit = vehicleLimits[update.plan];
        u.subscription.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        
        await u.save();
        console.log(`✅ ${u.email} mis à jour avec plan ${update.plan}`);
      }
    }

    // Afficher le résumé
    const allUsers = await User.find().select('email subscription.plan');
    console.log('\n📊 Résumé des abonnements:');
    allUsers.forEach(u => {
      console.log(`- ${u.email}: ${u.subscription.plan}`);
    });

    // Calculer les revenus
    const activeUsers = await User.find({
      'subscription.subscriptionStatus': 'active',
      'subscription.plan': { $ne: 'gratuit' }
    }).select('subscription.plan');

    const prices = {
      'starter': 9.90,
      'pro': 29.90,
      'business': 49.90,
      'unlimited': 99.90
    };

    const monthlyRevenue = activeUsers.reduce((total, u) => {
      return total + (prices[u.subscription.plan] || 0);
    }, 0);

    console.log('\n💰 Revenu mensuel calculé:', monthlyRevenue.toFixed(2), 'CHF');
    console.log('💰 Revenu annuel calculé:', (monthlyRevenue * 12).toFixed(2), 'CHF');
    console.log('👥 Abonnements actifs:', activeUsers.length);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

updateTestSubscription();
