import api from './axiosConfig';
import { format } from 'date-fns';

class RentalService {
  async fetchRentals(vehicleId = null) {
    try {
      const url = vehicleId 
        ? `/rentals?vehicleId=${vehicleId}`
        : '/rentals';
        
      const response = await api.get(url);
      
      return response.data.map(rental => ({
        id: rental.id,
        title: `Location - ${rental.vehicle.brand} ${rental.vehicle.model}`,
        vehicleId: rental.vehicle.id,
        start: new Date(rental.startDate),
        end: new Date(rental.endDate),
        renterName: rental.renterName,
        status: rental.status,
        rentalDetails: rental
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des locations:', error);
      throw error;
    }
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