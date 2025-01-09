import axios from 'axios';
import { format } from 'date-fns';

class RentalService {
  async fetchRentals(vehicleId = null) {
    try {
      const url = vehicleId 
        ? `/api/rentals?vehicleId=${vehicleId}`
        : '/api/rentals';
        
      const { data } = await axios.get(url);
      
      return data.map(rental => ({
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
      const { data } = await axios.post('/api/rentals/check-availability', {
        vehicleId,
        startDate,
        endDate
      });
      
      return data.available;
    } catch (error) {
      console.error('Erreur lors de la vérification de disponibilité:', error);
      throw error;
    }
  }

  async getRentalDetails(rentalId) {
    try {
      const { data } = await axios.get(`/api/rentals/${rentalId}`);
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des détails de location:', error);
      throw error;
    }
  }
}

export default new RentalService();