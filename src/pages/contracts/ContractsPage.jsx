import { useState, useEffect } from 'react';
import { Box, Typography, Fab, Alert, CircularProgress } from '@mui/material';
import { Add, Description } from '@mui/icons-material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import MobileList from '../../components/common/MobileList';
import AddContractDialog from './AddContractDialog';
import ContractDetails from './ContractDetails';
import contractService from '../../services/contractService';

const getStatusColor = (status) => {
  switch (status) {
      case 'À venir':
          return '#2196F3'; // Bleu
      case 'En cours':
          return '#4CAF50'; // Vert
      case 'Terminé':
          return '#9E9E9E'; // Gris
      default:
          return '#9E9E9E';
  }
};

const ContractsPage = () => {
  const [contracts, setContracts] = useState([]);
  const [selectedContract, setSelectedContract] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadContracts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await contractService.getContracts();
      setContracts(data);
    } catch (error) {
      console.error('Erreur lors du chargement des contrats:', error);
      setError('Impossible de charger les contrats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContracts();
  }, []);

  const handleAddContract = async (newContract) => {
    try {
      const savedContract = await contractService.createContract(newContract);
      await loadContracts();
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Erreur lors de la création du contrat:', error);
      setError('Impossible de créer le contrat');
    }
  };

  const handleContractClick = async (contract) => {
    try {
      const contractDetails = await contractService.getContractById(contract.id);
      setSelectedContract(contractDetails);
    } catch (error) {
      console.error('Erreur lors du chargement des détails du contrat:', error);
      setError('Impossible de charger les détails du contrat');
    }
  };

  const handleBackToList = () => {
    setSelectedContract(null);
    setError(null);
  };

  const formatContractDates = (startDate, endDate) => {
    return `${format(new Date(startDate), 'dd MMM', { locale: fr })} - ${format(new Date(endDate), 'dd MMM yyyy', { locale: fr })}`;
  };

  const getContractStatus = (contract) => {
    const now = new Date();
    const startDate = new Date(contract.rental.startDate);
    const endDate = new Date(contract.rental.endDate);
    
    if (now > endDate) return 'Terminé';
    if (now < startDate) return 'À venir';
    return 'En cours';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (selectedContract) {
    return (
      <ContractDetails 
        contract={selectedContract}
        onBack={handleBackToList}
      />
    );
  }

  return (
    <Box sx={{ px: 2, pb: 8 }}>
      <Typography variant="h5" sx={{ my: 3, fontWeight: 600 }}>
        Contrats de location
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <MobileList
        items={contracts.map(contract => ({
          id: contract.id,
          primary: `${contract.vehicle.brand} ${contract.vehicle.model}`,
          secondary: formatContractDates(contract.rental.startDate, contract.rental.endDate),
          tertiary: `${contract.renter.name} • ${contract.rental.amount}€`,
          status: {
            label: getContractStatus(contract),
            color: getStatusColor(getContractStatus(contract))
          },
          icon: <Description />
        }))}
        onItemClick={handleContractClick}
        emptyMessage="Aucun contrat de location"
      />

      <Fab
        color="primary"
        aria-label="Ajouter un contrat"
        onClick={() => setIsAddDialogOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 16
        }}
      >
        <Add />
      </Fab>

      <AddContractDialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddContract}
      />
    </Box>
  );
};

export default ContractsPage;