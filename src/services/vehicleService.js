import api from '../services/axiosConfig'; 

class VehicleService {
  async getVehicles() {
    try {
      console.log('Calling vehicles endpoint...'); 
      const { data } = await api.get('/vehicles');
      return this.formatVehiclesData(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des véhicules:', error);
      throw new Error('Impossible de récupérer la liste des véhicules');
    }
  }

 async getVehicleById(id) {
   try {
     const { data } = await api.get(`/vehicles/${id}`);
     return this.formatVehicleData(data);
   } catch (error) {
     console.error('Erreur lors de la récupération du véhicule:', error);
     throw new Error('Impossible de récupérer les détails du véhicule');
   }
 }

 async createVehicle(vehicleData) {
  try {
    const formData = new FormData();
    
    // Log pour déboguer
    console.log('Token:', localStorage.getItem('token'));
    console.log('Données à envoyer:', vehicleData);

    // Ajout des données de base du véhicule
    Object.keys(vehicleData).forEach(key => {
      if (key === 'features') {
        // Envoi direct du tableau pour features
        formData.append('features', JSON.stringify(vehicleData[key]));
      }
      else if (key !== 'images') {
        if (Array.isArray(vehicleData[key]) || 
            (typeof vehicleData[key] === 'object' && vehicleData[key] !== null)) {
          formData.append(key, JSON.stringify(vehicleData[key]));
        } else {
          formData.append(key, vehicleData[key]);
        }
      }
    });

    // Ajout des images si présentes
if (vehicleData.images && vehicleData.images.length > 0) {
  for(let i = 0; i < vehicleData.images.length; i++) {
    const image = vehicleData.images[i];
    console.log(`Ajout de l'image ${i + 1}:`, image);
    // Si l'image est un File ou Blob
    if (image instanceof File || image instanceof Blob) {
      formData.append('images', image, image.name); // Ajout du nom du fichier
    }
  }
}

const { data } = await api.post('/vehicles', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  },
  transformRequest: (data, headers) => {
    return formData; // Empêche axios de transformer le formData
  }
});

    console.log('Réponse du serveur:', data);
    return this.formatVehicleData(data);
  } catch (error) {
    console.error('Erreur détaillée:', error.response?.data || error);
    throw new Error(error.response?.data?.message || 'Impossible de créer le véhicule');
  }
}

 async updateVehicle(id, vehicleData) {
   try {
     const formData = new FormData();
     
     Object.keys(vehicleData).forEach(key => {
       if (key !== 'images') {
         if (Array.isArray(vehicleData[key]) || typeof vehicleData[key] === 'object') {
           formData.append(key, JSON.stringify(vehicleData[key]));
         } else {
           formData.append(key, vehicleData[key]);
         }
       }
     });

     if (vehicleData.images && vehicleData.images.length > 0) {
       vehicleData.images.forEach(image => {
         formData.append('images', image);
       });
     }

     const { data } = await api.put(`/vehicles/${id}`, formData, {
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
     const { data } = await api.get(`/vehicles/${id}/status`);
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

     await api.delete(`/vehicles/${id}`);
     return true;
   } catch (error) {
     console.error('Erreur lors de la suppression du véhicule:', error);
     throw new Error(error.response?.data?.message || 'Impossible de supprimer le véhicule');
   }
 }

 async archiveVehicle(id) {
   try {
     const { data } = await api.patch(`/vehicles/${id}/archive`);
     return this.formatVehicleData(data);
   } catch (error) {
     console.error('Erreur lors de l\'archivage du véhicule:', error);
     throw new Error('Impossible d\'archiver le véhicule');
   }
 }

 async getVehicleHistory(id) {
   try {
     const { data } = await api.get(`/vehicles/${id}/history`);
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
     const { data } = await api.post(`/vehicles/${id}/check-availability`, {
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
     _id: vehicle._id,
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