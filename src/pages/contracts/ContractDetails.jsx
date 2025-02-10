import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Grid, 
  Divider,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import contractService from '../../services/contractService';

const ContractDetails = ({ contractId, onClose }) => {
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadContractDetails = async () => {
      try {
        setLoading(true);
        const data = await contractService.getContractById(contractId);
        setContract(data);
      } catch (err) {
        setError('Impossible de charger les détails du contrat');
        console.error('Erreur lors du chargement du contrat:', err);
      } finally {
        setLoading(false);
      }
    };

    if (contractId) {
      loadContractDetails();
    }
  }, [contractId]);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!contract) {
    return <Alert severity="info">Aucun contrat sélectionné</Alert>;
  }

  return (
    <Paper sx={{ p: 3, maxWidth: '100%' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Détails du Contrat
        </Typography>
        <Typography color="textSecondary">
          Référence: {contract.contractNumber}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Informations du véhicule */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Véhicule
          </Typography>
          <Typography>
            {contract.vehicle.brand} {contract.vehicle.model}
          </Typography>
          <Typography color="textSecondary">
            Immatriculation: {contract.vehicle.licensePlate}
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Divider />
        </Grid>

        {/* Informations du locataire */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Locataire
          </Typography>
          <Typography>{contract.renter.firstName + ' ' + contract.renter.lastName}</Typography>
          <Typography>{contract.renter.email}</Typography>
          <Typography>{contract.renter.phone}</Typography>
        </Grid>

        <Grid item xs={12}>
          <Divider />
        </Grid>

        {/* Dates et tarifs */}
        <Grid item xs={12} sm={6}>
          <Typography variant="h6" gutterBottom>
            Période de location
          </Typography>
          <Typography>
            Du: {format(new Date(contract.startDate), 'dd MMMM yyyy', { locale: fr })}
          </Typography>
          <Typography>
            Au: {format(new Date(contract.endDate), 'dd MMMM yyyy', { locale: fr })}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="h6" gutterBottom>
            Tarification
          </Typography>
          <Typography>
            Montant total: {contract.rental.totalAmount.toLocaleString('fr-FR')} €
          </Typography>
          <Typography color="textSecondary">
            Caution: {contract.deposit.toLocaleString('fr-FR')} €
          </Typography>
        </Grid>

        {/* Actions */}
        <Grid item xs={12} sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => window.open(`${import.meta.env.VITE_API_URL}/contracts/${contractId}/pdf`, '_blank')}
            >
              Télécharger le contrat
            </Button>
            <Button variant="contained" onClick={onClose}>
              Fermer
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ContractDetails;