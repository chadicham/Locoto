const Contract = require('../models/contract.model');
const Vehicle = require('../models/vehicle.model');
const User = require('../models/user.model');
const { STRIPE_PLANS_PRICES } = require('../config/stripe.config');

exports.getStatistics = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Récupérer les paramètres de date depuis la requête (ou utiliser la date actuelle par défaut)
    const { year, month } = req.query;
    const today = new Date();
    const targetYear = year ? parseInt(year) : today.getFullYear();
    const targetMonth = month !== undefined ? parseInt(month) : today.getMonth();
    
    const firstDayOfMonth = new Date(targetYear, targetMonth, 1);
    const lastDayOfMonth = new Date(targetYear, targetMonth + 1, 0);
    const firstDayOfYear = new Date(targetYear, 0, 1);
    const lastDayOfYear = new Date(targetYear, 11, 31);

    // Récupération du nombre total de véhicules
    const totalVehicles = await Vehicle.countDocuments({ 
      owner: userId 
    });

    // Récupération des locations actives (pour la date actuelle, pas la date sélectionnée)
    const now = new Date();
    const activeRentals = await Contract.countDocuments({
      owner: userId,
      startDate: { $lte: now },
      endDate: { $gte: now },
      status: { $nin: ['cancelled', 'terminated'] }
    });

    // Calculer le revenu mensuel basé sur les contrats de location
    const monthlyContractsData = await Contract.find({
      owner: userId,
      createdAt: { 
        $gte: firstDayOfMonth, 
        $lte: lastDayOfMonth 
      },
      status: { $nin: ['cancelled'] } // Inclure les draft dans les statistiques
    }).select('rental.totalAmount');

    const monthlyRevenue = monthlyContractsData.reduce((total, contract) => {
      return total + (contract.rental?.totalAmount || 0);
    }, 0);

    // Calculer le revenu annuel basé sur les contrats de location
    const yearlyContractsData = await Contract.find({
      owner: userId,
      createdAt: { 
        $gte: firstDayOfYear, 
        $lte: lastDayOfYear 
      },
      status: { $nin: ['cancelled'] } // Inclure les draft dans les statistiques
    }).select('rental.totalAmount');

    const yearlyRevenue = yearlyContractsData.reduce((total, contract) => {
      return total + (contract.rental?.totalAmount || 0);
    }, 0);

    // Compter les contrats du mois et de l'année
    const monthlyContracts = monthlyContractsData.length;
    const yearlyContracts = yearlyContractsData.length;

    res.json({
      totalVehicles,
      activeRentals,
      monthlyRevenue, // Revenu total des contrats créés ce mois
      yearlyRevenue,  // Revenu total des contrats créés cette année
      monthlyContracts, // Nombre de contrats créés ce mois
      yearlyContracts,   // Nombre de contrats créés cette année
      selectedMonth: targetMonth, // Mois sélectionné (0-11)
      selectedYear: targetYear // Année sélectionnée
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des statistiques du tableau de bord' 
    });
  }
};

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

      // Récupérer les contrats créés ce mois-là
      const monthContracts = await Contract.find({
        owner: userId,
        createdAt: { 
          $gte: firstDayOfMonth, 
          $lte: lastDayOfMonth 
        },
        status: { $nin: ['cancelled'] } // Inclure les draft dans les statistiques
      }).select('rental.totalAmount');

      // Calculer le revenu du mois
      const revenue = monthContracts.reduce((total, contract) => {
        return total + (contract.rental?.totalAmount || 0);
      }, 0);

      monthlyData.push({
        month: month + 1,
        monthName: new Date(targetYear, month).toLocaleString('fr-FR', { month: 'long' }),
        contracts: monthContracts.length,
        revenue: revenue
      });
    }

    res.json({
      year: targetYear,
      months: monthlyData,
      totalRevenue: monthlyData.reduce((sum, m) => sum + m.revenue, 0),
      totalContracts: monthlyData.reduce((sum, m) => sum + m.contracts, 0)
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
      renterName: rental.renterName || `${rental.renter.firstName} ${rental.renter.lastName}`,
      renterId: rental.renterId || rental.renter.email,
      startDate: rental.startDate || rental.rental.startDate,
      endDate: rental.endDate || rental.rental.endDate,
      amount: rental.amount || rental.rental.totalAmount
    }));

    res.json(formattedRentals);

  } catch (error) {
    console.error('Erreur lors de la récupération des locations:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des locations actives' 
    });
  }
};