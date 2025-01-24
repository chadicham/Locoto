import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import { Warning } from '@mui/icons-material';
import vehicleService from '../../services/vehicleService';

const DeleteVehicleDialog = ({ open, vehicle, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Vérification des locations en cours
      const vehicleDetails = await vehicleService.getVehicleById(vehicle.id);
      if (vehicleDetails.isRented) {
        setError('Ce véhicule ne peut pas être supprimé car il a des locations en cours');
        return;
      }

      // Suppression du véhicule
      await vehicleService.deleteVehicle(vehicle.id);
      onSuccess();
      
    } catch (error) {
      setError(error.message || 'Une erreur est survenue lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Warning color="error" />
        <Typography variant="h6">
          Supprimer le véhicule
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Êtes-vous sûr de vouloir supprimer le véhicule suivant ?
          </Typography>
          
          <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              {vehicle?.brand} {vehicle?.model}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Immatriculation : {vehicle?.licensePlate}
            </Typography>
          </Box>

          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            Cette action est irréversible. L'historique des locations sera conservé
            mais le véhicule ne pourra plus être utilisé pour de nouvelles locations.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button 
          onClick={onClose}
          disabled={loading}
        >
          Annuler
        </Button>
        <Button
          onClick={handleDelete}
          variant="contained"
          color="error"
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? 'Suppression...' : 'Supprimer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteVehicleDialog;