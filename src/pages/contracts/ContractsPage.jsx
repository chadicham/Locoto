import { useState } from 'react';
import { Box, Typography, Fab } from '@mui/material';
import { Add, Description } from '@mui/icons-material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import MobileList from '../../components/common/MobileList';
import AddContractDialog from './AddContractDialog';
import ContractDetails from './ContractDetails';

const ContractsPage = () => {
  const [contracts, setContracts] = useState([]);
  const [selectedContract, setSelectedContract] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleAddContract = (newContract) => {
    setContracts(prev => [...prev, {
      ...newContract,
      id: Date.now(),
      status: 'En cours',
      createdAt: new Date().toISOString()
    }]);
    setIsAddDialogOpen(false);
  };

  const handleContractClick = (contract) => {
    setSelectedContract(contract);
  };

  const handleBackToList = () => {
    setSelectedContract(null);
  };

  const formatContractDates = (startDate, endDate) => {
    return `${format(new Date(startDate), 'dd MMM', { locale: fr })} - ${format(new Date(endDate), 'dd MMM yyyy', { locale: fr })}`;
  };

  const getContractStatus = (contract) => {
    const now = new Date();
    const endDate = new Date(contract.endDate);
    
    if (now > endDate) return 'Terminé';
    if (now < new Date(contract.startDate)) return 'À venir';
    return 'En cours';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'En cours': return 'primary';
      case 'Terminé': return 'success';
      case 'À venir': return 'info';
      default: return 'default';
    }
  };

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

      <MobileList
        items={contracts.map(contract => ({
          id: contract.id,
          primary: `${contract.vehicle.brand} ${contract.vehicle.model}`,
          secondary: `${formatContractDates(contract.startDate, contract.endDate)}`,
          tertiary: `${contract.renterName} • ${contract.totalAmount}€`,
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

      {isAddDialogOpen && (
        <AddContractDialog
          open={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          onSubmit={handleAddContract}
        />
      )}
    </Box>
  );
};

export default ContractsPage;