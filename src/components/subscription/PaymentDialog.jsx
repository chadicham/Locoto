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
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import stripeService from '../../services/stripeService';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const PaymentDialog = ({ open, onClose, plan, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError(null);
      await stripeService.createSubscription(plan.id);
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Confirmation d'abonnement
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {plan.name} - {plan.price}€/mois
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Vous serez redirigé vers une page de paiement sécurisée pour finaliser votre abonnement.
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Récapitulatif :
          </Typography>
          <Typography variant="body2">
            • Abonnement mensuel : {plan.price}€
            <br />
            • Nombre maximum de véhicules : {plan.maxVehicles || 'Illimité'}
            <br />
            • Renouvellement automatique
            <br />
            • Annulation possible à tout moment
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={loading}>
          Annuler
        </Button>
        <Button
          variant="contained"
          onClick={handlePayment}
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? 'Traitement en cours...' : 'Procéder au paiement'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentDialog;