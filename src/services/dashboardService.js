import axios from 'axios';

class DashboardService {
  // Récupération des données complètes du tableau de bord
  async getDashboardData() {
    try {
      const [statisticsData, rentalsData] = await Promise.all([
        this.getStatistics(),
        this.getCurrentRentals()
      ]);

      return {
        statistics: statisticsData,
        currentRentals: rentalsData
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des données du tableau de bord:', error);
      throw new Error('Impossible de charger les données du tableau de bord');
    }
  }

  // Récupération des statistiques générales
  async getStatistics() {
    try {
      const { data } = await axios.get('/api/dashboard/statistics');
      return {
        totalVehicles: data.totalVehicles,
        activeRentals: data.activeRentals,
        monthlyRevenue: data.monthlyRevenue
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw new Error('Impossible de charger les statistiques');
    }
  }

  // Récupération des locations en cours et à venir
  async getCurrentRentals() {
    try {
      const { data } = await axios.get('/api/dashboard/current-rentals');
      return data.map(rental => ({
        id: rental.id,
        vehicle: `${rental.vehicle.brand} ${rental.vehicle.model}`,
        vehicleId: rental.vehicle.id,
        renter: rental.renterName,
        renterId: rental.renterId,
        startDate: rental.startDate,
        endDate: rental.endDate,
        status: this.getRentalStatus(rental.startDate, rental.endDate),
        amount: rental.amount
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des locations:', error);
      throw new Error('Impossible de charger les locations');
    }
  }

  // Utilitaire pour déterminer le statut d'une location
  getRentalStatus(startDate, endDate) {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) return 'à venir';
    if (now > end) return 'terminée';
    return 'en cours';
  }
}

export default new DashboardService();