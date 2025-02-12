import axios from 'axios';

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

class DashboardService {
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

  async getStatistics() {
    try {
        const { data } = await axios.get('/dashboard/statistics');
        return {
            totalVehicles: data.totalVehicles || 0,
            activeRentals: data.activeRentals || 0,
            monthlyRevenue: new Intl.NumberFormat('fr-CH', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(data.monthlyRevenue || 0)
        };
    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        throw new Error('Impossible de charger les statistiques');
    }
}

async getCurrentRentals() {
    try {
        const { data } = await axios.get('/dashboard/current-rentals');
        return data.map(rental => ({
            id: rental._id || rental.id,
            vehicle: `${rental.vehicle.brand} ${rental.vehicle.model}`,
            vehicleId: rental.vehicle._id || rental.vehicle.id,
            renter: rental.renterName,
            renterId: rental.renterId,
            startDate: rental.startDate,
            endDate: rental.endDate,
            status: this.getRentalStatus(rental.startDate, rental.endDate),
            amount: new Intl.NumberFormat('fr-CH', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(rental.amount || 0)
        }));
    } catch (error) {
        console.error('Erreur lors de la récupération des locations:', error);
        throw new Error('Impossible de charger les locations');
    }
}

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