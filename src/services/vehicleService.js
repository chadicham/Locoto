import axios from 'axios';

class VehicleService {
  async getVehicles() {
    try {
      const { data } = await axios.get('/api/vehicles');
      return this.formatVehiclesData(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des véhicules:', error);
      throw new Error('Impossible de récupérer la liste des véhicules');
    }
  }

  async getVehicleById(id) {
    try {
      const { data } = await axios.get(`/api/vehicles/${id}`);
      return this.formatVehicleData(data);
    } catch (error) {
      console.error('Erreur lors de la récupération du véhicule:', error);
      throw new Error('Impossible de récupérer les détails du véhicule');
    }
  }

  async createVehicle(vehicleData) {
    try {
      const formData = new FormData();
      
      // Ajout des données de base du véhicule
      Object.keys(vehicleData).forEach(key => {
        if (key !== 'images') {
          formData.append(key, vehicleData[key]);
        }
      });

      // Ajout des images si présentes
      if (vehicleData.images) {
        vehicleData.images.forEach(image => {
          formData.append('images', image);
        });
      }

      const { data } = await axios.post('/api/vehicles', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return this.formatVehicleData(data);
    } catch (error) {
      console.error('Erreur lors de la création du véhicule:', error);
      throw new Error('Impossible de créer le véhicule');
    }
  }

  async updateVehicle(id, vehicleData) {
    try {
      const formData = new FormData();
      
      Object.keys(vehicleData).forEach(key => {
        if (key !== 'images') {
          formData.append(key, vehicleData[key]);
        }
      });

      if (vehicleData.images) {
        vehicleData.images.forEach(image => {
          formData.append('images', image);
        });
      }

      const { data } = await axios.put(`/api/vehicles/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return this.formatVehicleData(data);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du véhicule:', error);
      throw new Error('Impossible de mettre à jour le véhicule');
    }
  }

  async checkVehicleStatus(id) {
    try {
      const { data } = await axios.get(`/api/vehicles/${id}/status`);
      return {
        isRented: data.isRented,
        currentRental: data.currentRental,
        upcomingRentals: data.upcomingRentals,
        canBeDeleted: !data.isRented && data.upcomingRentals.length === 0
      };
    } catch (error) {
      console.error('Erreur lors de la vérification du statut du véhicule:', error);
      throw new Error('Impossible de vérifier le statut du véhicule');
    }
  }

  async deleteVehicle(id) {
    try {
      const status = await this.checkVehicleStatus(id);
      
      if (!status.canBeDeleted) {
        if (status.isRented) {
          throw new Error('Ce véhicule ne peut pas être supprimé car il est actuellement en location');
        }
        if (status.upcomingRentals.length > 0) {
          throw new Error('Ce véhicule ne peut pas être supprimé car il a des locations à venir');
        }
      }

      await axios.delete(`/api/vehicles/${id}`);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du véhicule:', error);
      throw new Error(error.response?.data?.message || 'Impossible de supprimer le véhicule');
    }
  }

  async archiveVehicle(id) {
    try {
      const { data } = await axios.patch(`/api/vehicles/${id}/archive`);
      return this.formatVehicleData(data);
    } catch (error) {
      console.error('Erreur lors de l\'archivage du véhicule:', error);
      throw new Error('Impossible d\'archiver le véhicule');
    }
  }

  async getVehicleHistory(id) {
    try {
      const { data } = await axios.get(`/api/vehicles/${id}/history`);
      return data.map(rental => ({
        id: rental.id,
        renterName: rental.renterName,
        startDate: rental.startDate,
        endDate: rental.endDate,
        amount: rental.amount,
        status: rental.status
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
      throw new Error('Impossible de récupérer l\'historique du véhicule');
    }
  }

  async checkAvailability(id, startDate, endDate) {
    try {
      const { data } = await axios.post(`/api/vehicles/${id}/check-availability`, {
        startDate,
        endDate
      });
      return data.available;
    } catch (error) {
      console.error('Erreur lors de la vérification de disponibilité:', error);
      throw new Error('Impossible de vérifier la disponibilité du véhicule');
    }
  }

  // Méthodes utilitaires pour le formatage des données
  formatVehiclesData(vehicles) {
    return vehicles.map(vehicle => this.formatVehicleData(vehicle));
  }

  formatVehicleData(vehicle) {
    return {
      id: vehicle._id,
      brand: vehicle.brand,
      model: vehicle.model,
      type: vehicle.type,
      licensePlate: vehicle.licensePlate,
      fuel: vehicle.fuel,
      year: vehicle.year,
      mileage: vehicle.mileage,
      dailyRate: vehicle.dailyRate,
      images: vehicle.images || [],
      features: vehicle.features || [],
      description: vehicle.description,
      isAvailable: this.checkVehicleAvailability(vehicle),
      isArchived: vehicle.isArchived || false,
      maintenanceHistory: vehicle.maintenanceHistory || [],
      lastMaintenanceDate: vehicle.lastMaintenanceDate,
      nextMaintenanceDate: vehicle.nextMaintenanceDate
    };
  }

  checkVehicleAvailability(vehicle) {
    if (vehicle.isArchived) return false;
    if (!vehicle.currentRental) return true;
    
    const now = new Date();
    const rentalEnd = new Date(vehicle.currentRental.endDate);
    return rentalEnd < now;
  }
}

export default new VehicleService();