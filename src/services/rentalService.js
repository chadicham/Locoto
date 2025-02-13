import api from './axiosConfig';
import { format } from 'date-fns';

class RentalService {
  async fetchRentals(vehicleId = null) {
    try {
      const url = vehicleId 
        ? `/contracts?vehicleId=${vehicleId}`
        : '/contracts';
        
      const { data } = await api.get(url);
      
      // Formater les données pour le calendrier
      return data.map(contract => ({
        id: contract._id,
        title: `${contract.vehicle.brand} ${contract.vehicle.model}`,
        vehicleId: contract.vehicle._id,
        start: new Date(contract.rental.startDate),
        end: new Date(contract.rental.endDate),
        renterName: `${contract.renter.firstName} ${contract.renter.lastName}`,
        status: this.getContractStatus(contract),
        rentalDetails: contract
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des locations:', error);
      throw error;
    }
  }

  async getContractById(id) {
    try {
      const { data } = await api.get(`/contracts/${id}`);
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération du contrat:', error);
      throw error;
    }
  }
  
  // Méthode helper pour déterminer le statut
  getContractStatus(contract) {
    const now = new Date();
    const startDate = new Date(contract.rental.startDate);
    const endDate = new Date(contract.rental.endDate);
    
    if (now > endDate) return 'completed';
    if (now < startDate) return 'pending';
    return 'inProgress';
  }

  async checkAvailability(vehicleId, startDate, endDate) {
    try {
      const response = await api.post('/rentals/check-availability', {
        vehicleId,
        startDate,
        endDate
      });
      
      return response.data.available;
    } catch (error) {
      console.error('Erreur lors de la vérification de disponibilité:', error);
      throw error;
    }
  }

  async getRentalDetails(rentalId) {
    try {
      const response = await api.get(`/rentals/${rentalId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des détails de location:', error);
      throw error;
    }
  }
}

export default new RentalService();