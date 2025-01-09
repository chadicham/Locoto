import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert
} from '@mui/material';
import { CheckCircle, Info } from '@mui/icons-material';
import PaymentDialog from '../../components/subscription/PaymentDialog';
import stripeService from '../../services/stripeService';

const plans = [
  {
    id: 'free',
    name: 'Gratuit',
    price: 0,
    vehicles: 1,
    features: ['1 véhicule', 'Contrats illimités', 'Support par email'],
    isPopular: false
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 10,
    vehicles: 3,
    features: ['3 véhicules', 'Contrats illimités', 'Support prioritaire'],
    isPopular: true
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 15,
    vehicles: 5,
    features: ['5 véhicules', 'Contrats illimités', 'Support téléphonique'],
    isPopular: false
  },
  {
    id: 'business',
    name: 'Business',
    price: 30,
    vehicles: 10,
    features: ['10 véhicules', 'Contrats illimités', 'Support dédié'],
    isPopular: false
  },
  {
    id: 'unlimited',
    name: 'Illimité',
    price: 60,
    vehicles: null,
    features: ['Véhicules illimités', 'Contrats illimités', 'Support prioritaire 24/7'],
    isPopular: false
  }
];

const SubscriptionPage = () => {
  const [currentPlan, setCurrentPlan] = useState('free');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await stripeService.getCurrentSubscription();
      setSubscription(data);
      setCurrentPlan(data.planId);
    } catch (err) {
      setError('Erreur lors du chargement de l'abonnement');
      console.error('Subscription loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = (plan) => {
    if (plan.id === currentPlan) return;
    setSelectedPlan(plan);
  };

  const handlePaymentSuccess = () => {
    setSelectedPlan(null);
    loadSubscription();
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, pb: 8 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Abonnement
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Forfait actuel
        </Typography>
        <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
          {plans.find(p => p.id === currentPlan)?.name || 'Gratuit'}
        </Typography>
        {subscription && (
          <Typography variant="body2" color="text.secondary">
            Prochain renouvellement : {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
          </Typography>
        )}
      </Paper>

      <Grid container spacing={3}>
        {plans.map((plan) => (
          <Grid item xs={12} md={4} key={plan.id}>
            <Card 
              sx={{ 
                height: '100%',
                position: 'relative',
                ...(plan.isPopular && {
                  border: '2px solid',
                  borderColor: 'primary.main'
                })
              }}
            >
              {plan.isPopular && (
                <Chip
                  label="Plus populaire"
                  color="primary"
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: -12,
                    right: 16
                  }}
                />
              )}

              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {plan.name}
                </Typography>
                <Typography variant="h4" color="primary" gutterBottom>
                  {plan.price}€
                  <Typography component="span" variant="body2" color="text.secondary">
                    /mois
                  </Typography>
                </Typography>
                <List dense>
                  {plan.features.map((feature, index) => (
                    <ListItem key={index} disableGutters>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <CheckCircle color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={feature} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>

              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button 
                  fullWidth
                  variant={currentPlan === plan.id ? "outlined" : "contained"}
                  onClick={() => handlePlanSelect(plan)}
                  disabled={currentPlan === plan.id}
                >
                  {currentPlan === plan.id ? 'Forfait actuel' : 'Sélectionner'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {selectedPlan && (
        <PaymentDialog
          open={!!selectedPlan}
          onClose={() => setSelectedPlan(null)}
          plan={selectedPlan}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </Box>
  );
};

export default SubscriptionPage;