import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    CircularProgress,
    Alert,
    List,
    ListItem,
    ListItemIcon,
    ListItemText
  } from '@mui/material';
  import { CheckCircle, Lock } from '@mui/icons-material';
  import { useState } from 'react';
  import stripeService from '../../services/stripeService';
  
  const PaymentDialog = ({ open, onClose, plan, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
  
    const handlePayment = async () => {
      try {
        setLoading(true);
        setError(null);
        await stripeService.initiateSubscription(plan.id);
        onSuccess();
      } catch (err) {
        setError(err.message);
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
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Lock color="primary" />
            <Typography variant="h6">
              Confirmation d'abonnement
            </Typography>
          </Box>
        </DialogTitle>
  
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              {plan.name} - {plan.price}CHF/mois
            </Typography>
  
            <Typography variant="body2" color="text.secondary" paragraph>
              Vous allez être redirigé vers notre plateforme de paiement sécurisée pour finaliser votre abonnement.
            </Typography>
  
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary={`Jusqu'à ${plan.vehicles || 'illimité'} véhicules`} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Paiement sécurisé" 
                  secondary="Vos informations bancaires sont chiffrées"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Sans engagement" 
                  secondary="Annulation possible à tout moment"
                />
              </ListItem>
            </List>
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
            variant="contained"
            onClick={handlePayment}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Traitement en cours...' : 'Procéder au paiement'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  export default PaymentDialog;