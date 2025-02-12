import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  Grid,
  IconButton,
  Fab,
  Chip,
  CircularProgress,
  Alert,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Add,
  MoreVert,
  Edit,
  Delete,
  History
} from '@mui/icons-material';
import vehicleService from "../../services/vehicleService";
import AddVehicleDialog from './AddVehicleDialog';
import DeleteVehicleDialog from "../../components/vehicles/DeleteVehiclesDialog";

const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await vehicleService.getVehicles();
      setVehicles(data);
    } catch (err) {
      setError('Erreur lors du chargement des véhicules');
      console.error('Error loading vehicles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event, vehicle) => {
    setAnchorEl(event.currentTarget);
    setSelectedVehicle(vehicle);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedVehicle(null);
  };

  const handleEdit = () => {
    // TODO: Implémenter la modification
    handleMenuClose();
  };

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleViewHistory = () => {
    // TODO: Implémenter la vue de l'historique
    handleMenuClose();
  };

  const VehicleCard = ({ vehicle }) => (
    <Card sx={{ height: '100%', p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">
          {vehicle.brand} {vehicle.model}
        </Typography>
        <IconButton onClick={(e) => handleMenuOpen(e, vehicle)}>
          <MoreVert />
        </IconButton>
      </Box>

      <Typography color="text.secondary" gutterBottom>
        {vehicle.licensePlate}
      </Typography>

      <Grid container spacing={1} sx={{ mb: 2 }}>
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">
            Type
          </Typography>
          <Typography variant="body1">
            {vehicle.type}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">
            Carburant
          </Typography>
          <Typography variant="body1">
            {vehicle.fuel}
          </Typography>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Chip 
          label={vehicle.isAvailable ? 'Disponible' : 'Indisponible'}
          color={vehicle.isAvailable ? 'success' : 'default'}
          size="small"
        />
        <Typography variant="h6" color="primary">
          {vehicle.dailyRate}CHF/jour
        </Typography>
      </Box>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>
          Mes véhicules
        </Typography>
        <Fab
          color="primary"
          aria-label="Ajouter un véhicule"
          onClick={() => setIsAddDialogOpen(true)}
          size="medium"
        >
          <Add />
        </Fab>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {vehicles.map((vehicle) => (
          <Grid item xs={12} sm={6} md={4} key={vehicle.id}>
            <VehicleCard vehicle={vehicle} />
          </Grid>
        ))}
        {vehicles.length === 0 && !loading && (
          <Grid item xs={12}>
            <Alert severity="info">
              Vous n'avez pas encore ajouté de véhicule. Cliquez sur le bouton + pour commencer.
            </Alert>
          </Grid>
        )}
      </Grid>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <Edit sx={{ mr: 1 }} fontSize="small" /> Modifier
        </MenuItem>
        <MenuItem onClick={handleViewHistory}>
          <History sx={{ mr: 1 }} fontSize="small" /> Historique
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} fontSize="small" /> Supprimer
        </MenuItem>
      </Menu>

      {/* Dialogues */}
      {isAddDialogOpen && (
        <AddVehicleDialog
          open={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          onSuccess={() => {
            setIsAddDialogOpen(false);
            loadVehicles();
          }}
        />
      )}

      {isDeleteDialogOpen && selectedVehicle && (
        <DeleteVehicleDialog
          open={isDeleteDialogOpen}
          vehicle={selectedVehicle}
          onClose={() => setIsDeleteDialogOpen(false)}
          onSuccess={() => {
            setIsDeleteDialogOpen(false);
            loadVehicles();
          }}
        />
      )}
    </Box>
  );
};

export default VehiclesPage;