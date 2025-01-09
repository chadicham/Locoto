import { useState } from 'react';
import { Box, Typography, Fab } from '@mui/material';
import { DirectionsCar, Add } from '@mui/icons-material';
import MobileList from '../components/common/MobileList';
import MobileCard from '../components/common/MobileCard';

const Vehicles = () => {
  const [vehicles] = useState([
    {
      id: 1,
      primary: 'Renault Clio',
      secondary: 'Immatriculation : AB-123-CD',
      icon: <DirectionsCar />
    },
    {
      id: 2,
      primary: 'Peugeot 208',
      secondary: 'Immatriculation : EF-456-GH',
      icon: <DirectionsCar />
    }
  ]);

  const handleVehicleClick = (vehicle) => {
    console.log('Vehicle clicked:', vehicle);
  };

  return (
    <Box sx={{ pb: 8 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Mes véhicules
      </Typography>

      <MobileList
        items={vehicles}
        onItemClick={handleVehicleClick}
        emptyMessage="Aucun véhicule enregistré"
      />

      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 16,
        }}
      >
        <Add />
      </Fab>
    </Box>
  );
};

export default Vehicles;