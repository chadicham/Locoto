import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  Alert,
  CircularProgress
} from '@mui/material';
import { Warning } from '@mui/icons-material';
import stripeService from '../../services/stripeService';

const CancelSubscriptionDialog = ({ open, onClose, currentPlan, onSuccess }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCancel = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await stripeService.cancelSubscription({ reason });
      onSuccess(result);
      onClose();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Warning color="warning" />
        <Typography variant="h6">
          Annuler l'abonnement
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Êtes-vous sûr de vouloir annuler votre abonnement {currentPlan} ?
          </Typography>

          <Typography variant="body2" color="text.secondary" paragraph>
            Votre abonnement restera actif jusqu'à la fin de la période de facturation en cours. 
            Après cela, vous reviendrez automatiquement au forfait gratuit.
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Raison de l'annulation (facultatif)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Aidez-nous à nous améliorer en nous indiquant la raison de votre départ"
            sx={{ mt: 2 }}
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={onClose} disabled={loading}>
          Retour
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={handleCancel}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Annulation en cours...' : 'Confirmer l\'annulation'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CancelSubscriptionDialog;