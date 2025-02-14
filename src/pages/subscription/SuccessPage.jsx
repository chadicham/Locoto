import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, CircularProgress, Typography } from '@mui/material';
import stripeService from '../../services/stripeService';
import { updateSubscription, selectUser } from '../../store/store'; // ajustez le chemin selon votre structure

const SuccessPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState(null);
  const userState = useSelector(selectUser); // Ajout du selector

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        const sessionId = searchParams.get('session_id');
        if (!sessionId) {
          throw new Error('Session ID manquant');
        }

        // Vérifier le statut de la session
        const result = await stripeService.checkSession(sessionId);
        console.log('Réponse checkSession:', result);
        
        if (result.success) {
          // Mettre à jour l'état de l'abonnement dans Redux
          const subscriptionData = {
            planId: result.planId,
            status: result.status,
            currentPeriodEnd: result.currentPeriodEnd,
            vehicleLimit: getVehicleLimitFromPlan(result.planId)
          };
          
          console.log('Données abonnement à dispatcher:', subscriptionData);
          dispatch(updateSubscription(subscriptionData));
          console.log('Dispatch effectué');
          console.log('État utilisateur après dispatch:', userState);
          
          navigate('/subscription', {
            replace: true,
            state: { success: true }
          });
        } else {
          throw new Error('Le paiement n\'a pas été complété');
        }
      } catch (err) {
        console.error('Erreur:', err);
        setError(err.message);
        setTimeout(() => {
          navigate('/subscription', { replace: true });
        }, 3000);
      }
    };

    checkPaymentStatus();
  }, [navigate, dispatch, searchParams, userState]);

  const getVehicleLimitFromPlan = (planId) => {
    const limits = {
      'free': 1,
      'starter': 3,
      'pro': 5,
      'business': 10,
      'unlimited': 999
    };
    return limits[planId] || 0;
  };

  if (error) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100vh',
          gap: 2
        }}
      >
        <Typography color="error">
          {error}
        </Typography>
        <Typography variant="body2">
          Redirection en cours...
        </Typography>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        gap: 2
      }}
    >
      <CircularProgress />
      <Typography>
        Vérification de votre paiement...
      </Typography>
      <Typography variant="body2">
        État actuel: {JSON.stringify(userState.subscription)}
      </Typography>
    </Box>
  );
};

export default SuccessPage;