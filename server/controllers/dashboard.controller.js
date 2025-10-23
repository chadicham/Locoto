const Contract = require('../models/contract.model');
const Vehicle = require('../models/vehicle.model');
const User = require('../models/user.model');
const { STRIPE_PLANS_PRICES } = require('../config/stripe.config');

exports.getStatistics = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const firstDayOfYear = new Date(currentYear, 0, 1);

    // Récupération du nombre total de véhicules
    const totalVehicles = await Vehicle.countDocuments({ 
      owner: userId 
    });

    // Récupération des locations actives
    const activeRentals = await Contract.countDocuments({
      owner: userId,
      startDate: { $lte: today },
      endDate: { $gte: today },
      status: { $nin: ['cancelled', 'terminated'] }
    });

    // Calcul des revenus basés sur les nouveaux abonnements du mois
    const monthlySubscriptions = await User.countDocuments({
      'subscription.stripeSubscriptionId': { $exists: true },
      'subscription.subscriptionStatus': 'active',
      createdAt: { 
        $gte: firstDayOfMonth, 
        $lte: lastDayOfMonth 
      }
    });

    // Calcul des revenus basés sur les abonnements de l'année
    const yearlySubscriptions = await User.countDocuments({
      'subscription.stripeSubscriptionId': { $exists: true },
      'subscription.subscriptionStatus': 'active',
      createdAt: { 
        $gte: firstDayOfYear, 
        $lte: today 
      }
    });

    // Récupérer tous les utilisateurs avec abonnement actif créés ce mois
    const monthlyUsers = await User.find({
      'subscription.stripeSubscriptionId': { $exists: true },
      'subscription.subscriptionStatus': 'active',
      createdAt: { 
        $gte: firstDayOfMonth, 
        $lte: lastDayOfMonth 
      }
    }).select('subscription.plan');

    // Récupérer tous les utilisateurs avec abonnement actif créés cette année
    const yearlyUsers = await User.find({
      'subscription.stripeSubscriptionId': { $exists: true },
      'subscription.subscriptionStatus': 'active',
      createdAt: { 
        $gte: firstDayOfYear, 
        $lte: today 
      }
    }).select('subscription.plan');

    // Calculer le revenu mensuel basé sur les plans
    const monthlyRevenue = monthlyUsers.reduce((total, user) => {
      const planPrice = getPlanPrice(user.subscription.plan);
      return total + planPrice;
    }, 0);

    // Calculer le revenu annuel basé sur les plans
    const yearlyRevenue = yearlyUsers.reduce((total, user) => {
      const planPrice = getPlanPrice(user.subscription.plan);
      return total + planPrice;
    }, 0);

    res.json({
      totalVehicles,
      activeRentals,
      monthlyRevenue,
      yearlyRevenue,
      monthlySubscriptions,
      yearlySubscriptions
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des statistiques du tableau de bord' 
    });
  }
};

// Fonction utilitaire pour obtenir le prix d'un plan
function getPlanPrice(planName) {
  const prices = {
    'gratuit': 0,
    'starter': 9.90,
    'pro': 29.90,
    'business': 49.90,
    'unlimited': 99.90
  };
  return prices[planName] || 0;
}

// Nouvelle fonction pour obtenir les revenus mensuels détaillés
exports.getMonthlyRevenue = async (req, res) => {
  try {
    const userId = req.user.id;
    const { year } = req.query;
    const targetYear = year ? parseInt(year) : new Date().getFullYear();

    const monthlyData = [];

    // Pour chaque mois de l'année
    for (let month = 0; month < 12; month++) {
      const firstDayOfMonth = new Date(targetYear, month, 1);
      const lastDayOfMonth = new Date(targetYear, month + 1, 0);

      // Compter les abonnements créés ce mois-là
      const monthSubscriptions = await User.countDocuments({
        'subscription.stripeSubscriptionId': { $exists: true },
        'subscription.subscriptionStatus': 'active',
        createdAt: { 
          $gte: firstDayOfMonth, 
          $lte: lastDayOfMonth 
        }
      });

      // Récupérer les utilisateurs avec leurs plans
      const monthUsers = await User.find({
        'subscription.stripeSubscriptionId': { $exists: true },
        'subscription.subscriptionStatus': 'active',
        createdAt: { 
          $gte: firstDayOfMonth, 
          $lte: lastDayOfMonth 
        }
      }).select('subscription.plan');

      // Calculer le revenu du mois
      const revenue = monthUsers.reduce((total, user) => {
        return total + getPlanPrice(user.subscription.plan);
      }, 0);

      monthlyData.push({
        month: month + 1,
        monthName: new Date(targetYear, month).toLocaleString('fr-FR', { month: 'long' }),
        subscriptions: monthSubscriptions,
        revenue: revenue
      });
    }

    res.json({
      year: targetYear,
      months: monthlyData,
      totalRevenue: monthlyData.reduce((sum, m) => sum + m.revenue, 0),
      totalSubscriptions: monthlyData.reduce((sum, m) => sum + m.subscriptions, 0)
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des revenus mensuels:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des revenus mensuels' 
    });
  }
};

exports.getCurrentRentals = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();

    // Récupération des locations en cours et à venir
    const rentals = await Contract.find({
      owner: userId,
      endDate: { $gte: today },
      status: { $nin: ['cancelled', 'terminated'] }
    })
    .populate('vehicle', 'brand model licensePlate')
    .sort({ startDate: 1 })
    .limit(10);

    const formattedRentals = rentals.map(rental => ({
      id: rental._id,
      vehicle: {
        id: rental.vehicle._id,
        brand: rental.vehicle.brand,
        model: rental.vehicle.model,
        licensePlate: rental.vehicle.licensePlate
      },
      renterName: rental.renterName,
      renterId: rental.renterId,
      startDate: rental.startDate,
      endDate: rental.endDate,
      amount: rental.amount
    }));

    res.json(formattedRentals);

  } catch (error) {
    console.error('Erreur lors de la récupération des locations:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des locations actives' 
    });
  }
};