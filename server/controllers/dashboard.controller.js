const Contract = require('../models/contract.model');
const Vehicle = require('../models/vehicle.model');

exports.getStatistics = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

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

    // Calcul des revenus du mois
    const monthlyContracts = await Contract.find({
      owner: userId,
      startDate: { $gte: firstDayOfMonth, $lte: lastDayOfMonth },
      status: 'completed'
    });

    const monthlyRevenue = monthlyContracts.reduce(
      (total, contract) => total + contract.amount,
      0
    );

    res.json({
      totalVehicles,
      activeRentals,
      monthlyRevenue
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des statistiques du tableau de bord' 
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