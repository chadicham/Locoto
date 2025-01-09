import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Grid,
  Divider,
  CircularProgress,
  IconButton,
  Alert
} from '@mui/material';
import {
  Close as CloseIcon,
  EventNote as EventNoteIcon,
  CarRental as CarRentalIcon,
  Euro as EuroIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import RentalService from '../../services/rentalService';

const RentalDetailsDialog = ({ open, onClose, rentalId }) => {
  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (rentalId && open) {
      loadRentalDetails();
    }
    return () => {
      // Nettoyage lors de la fermeture
      if (!open) {
        setRental(null);
        setError(null);
      }
    };
  }, [rentalId, open]);

  const loadRentalDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const details = await RentalService.getRentalDetails(rentalId);
      setRental(details);
    } catch (error) {
      setError('Erreur lors du chargement des détails de la location');
      console.error('Error loading rental details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      pending: 'warning',
      confirmed: 'success',
      completed: 'default',
      cancelled: 'error',
      inProgress: 'info'
    };
    return statusColors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const statusLabels = {
      pending: 'En attente',
      confirmed: 'Confirmée',
      completed: 'Terminée',
      cancelled: 'Annulée',
      inProgress: 'En cours'
    };
    return statusLabels[status] || status;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  if (!open) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        <Typography variant="h6" component="div">
          {loading ? 'Chargement des détails...' : 'Détails de la location'}
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            minHeight: '300px'
          }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : rental && (
          <Box>
            {/* En-tête avec informations principales */}
            <Box sx={{ 
              mb: 3, 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                <CarRentalIcon sx={{ mr: 1 }} />
                {rental.vehicle.brand} {rental.vehicle.model}
              </Typography>
              <Chip
                label={getStatusLabel(rental.status)}
                color={getStatusColor(rental.status)}
                sx={{ fontWeight: 500 }}
              />
            </Box>

            <Grid container spacing={3}>
              {/* Informations du locataire */}
              <Grid item xs={12} md={6}>
                <Box sx={{ 
                  p: 2, 
                  bgcolor: 'background.default',
                  borderRadius: 1
                }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                    Informations du locataire
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {rental.renterName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {rental.renterEmail}
                    <br />
                    {rental.renterPhone}
                  </Typography>
                </Box>
              </Grid>

              {/* Période de location */}
              <Grid item xs={12} md={6}>
                <Box sx={{ 
                  p: 2, 
                  bgcolor: 'background.default',
                  borderRadius: 1
                }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ 
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <EventNoteIcon sx={{ mr: 1 }} />
                    Période de location
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Du {format(new Date(rental.startDate), 'dd MMMM yyyy', { locale: fr })}
                    <br />
                    Au {format(new Date(rental.endDate), 'dd MMMM yyyy', { locale: fr })}
                  </Typography>
                </Box>
              </Grid>

              {/* Informations véhicule */}
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>

              {/* Kilométrage */}
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                    Kilométrage
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Initial
                      </Typography>
                      <Typography variant="body1">
                        {rental.initialMileage} km
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Autorisé
                      </Typography>
                      <Typography variant="body1">
                        {rental.allowedMileage} km
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>

              {/* Informations financières */}
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ 
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <EuroIcon sx={{ mr: 1 }} />
                    Informations financières
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Location
                      </Typography>
                      <Typography variant="body1">
                        {formatPrice(rental.rentalAmount)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Caution
                      </Typography>
                      <Typography variant="body1">
                        {formatPrice(rental.deposit)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>

              {/* Notes */}
              {rental.notes && (
                <Grid item xs={12}>
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: 'background.default',
                    borderRadius: 1
                  }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ 
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <AssignmentIcon sx={{ mr: 1 }} />
                      Notes
                    </Typography>
                    <Typography variant="body2">
                      {rental.notes}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button onClick={onClose}>
          Fermer
        </Button>
        {rental && rental.status === 'confirmed' && (
          <Button 
            variant="contained" 
            onClick={() => window.open(`/contracts/${rental.contractId}`, '_blank')}
            startIcon={<AssignmentIcon />}
          >
            Voir le contrat
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default RentalDetailsDialog;