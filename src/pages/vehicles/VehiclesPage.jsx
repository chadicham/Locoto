import { useState } from 'react';
import { Box, Typography, Fab } from '@mui/material';
import { DirectionsCar, Add } from '@mui/icons-material';
import MobileList from '../../components/common/MobileList';
import AddVehicleDialog from './AddVehicleDialog';
import VehicleDetails from './VehicleDetails';

const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleAddVehicle = (newVehicle) => {
    setVehicles(prev => [...prev, {
      ...newVehicle,
      id: Date.now() // Temporaire, à remplacer par l'ID de la base de données
    }]);
    setIsAddDialogOpen(false);
  };

  const handleVehicleClick = (vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const handleBackToList = () => {
    setSelectedVehicle(null);
  };

  const handleDeleteVehicle = (vehicleId) => {
    // Ajouter une confirmation avant suppression
    setVehicles(prev => prev.filter(vehicle => vehicle.id !== vehicleId));
    setSelectedVehicle(null);
  };

  if (selectedVehicle) {
    return (
      <VehicleDetails 
        vehicle={selectedVehicle}
        onBack={handleBackToList}
        onDelete={() => handleDeleteVehicle(selectedVehicle.id)}
      />
    );
  }

  return (
    <Box sx={{ px: 2, pb: 8 }}>
      <Typography variant="h5" sx={{ my: 3, fontWeight: 600 }}>
        Mes véhicules
      </Typography>

      <MobileList
        items={vehicles.map(vehicle => ({
          id: vehicle.id,
          primary: `${vehicle.brand} ${vehicle.model}`,
          secondary: `${vehicle.licensePlate} • ${vehicle.fuel} • ${vehicle.dailyRate}€/jour`,
          icon: <DirectionsCar />
        }))}
        onItemClick={handleVehicleClick}
        emptyMessage="Vous n'avez pas encore ajouté de véhicule"
      />

      <Fab
        color="primary"
        aria-label="Ajouter un véhicule"
        onClick={() => setIsAddDialogOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 16
        }}
      >
        <Add />
      </Fab>

      <AddVehicleDialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddVehicle}
      />
    </Box>
  );
};

export default VehiclesPage;