import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Button,
  Alert
} from '@mui/material';
import {
  DirectionsCar,
  Description,
  AccountBalance,
  ChevronRight
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import dashboardService from '../services/dashboardService';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    statistics: {
      totalVehicles: 0,
      activeRentals: 0,
      monthlyRevenue: 0
    },
    currentRentals: []
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getDashboardData();
      setDashboardData(data);
    } catch (error) {
      setError('Impossible de charger les données du tableau de bord');
      console.error('Erreur chargement dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRentalClick = (rentalId) => {
    navigate(`/contracts/${rentalId}`);
  };

  const StatCard = ({ title, value, icon: Icon, suffix = '' }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              backgroundColor: 'primary.light',
              borderRadius: 2,
              p: 1,
              mr: 2,
              display: 'flex'
            }}
          >
            <Icon sx={{ color: 'primary.main' }} />
          </Box>
          <Box>
            <Typography color="text.secondary" variant="body2" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h5" component="div">
              {value}{suffix}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Tableau de bord
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <StatCard
            title="Véhicules"
            value={dashboardData.statistics.totalVehicles}
            icon={DirectionsCar}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            title="Locations en cours"
            value={dashboardData.statistics.activeRentals}
            icon={Description}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            title="Revenus du mois"
            value={`${dashboardData.statistics.monthlyRevenue.toLocaleString('fr-FR')}`}
            suffix="€"
            icon={AccountBalance}
          />
        </Grid>
      </Grid>

      <Box sx={{ mb: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2 
        }}>
          <Typography variant="h6">Locations en cours et à venir</Typography>
          <Button 
            endIcon={<ChevronRight />}
            onClick={() => navigate('/calendar')}
          >
            Voir le calendrier
          </Button>
        </Box>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Véhicule</TableCell>
                <TableCell>Locataire</TableCell>
                <TableCell>Début</TableCell>
                <TableCell>Fin</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell align="right">Montant</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dashboardData.currentRentals.map((rental) => (
                <TableRow 
                  key={rental.id}
                  hover
                  onClick={() => handleRentalClick(rental.id)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{rental.vehicle}</TableCell>
                  <TableCell>{rental.renter}</TableCell>
                  <TableCell>
                    {format(new Date(rental.startDate), 'dd MMM yyyy', { locale: fr })}
                  </TableCell>
                  <TableCell>
                    {format(new Date(rental.endDate), 'dd MMM yyyy', { locale: fr })}
                  </TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: rental.status === 'en cours' ? 'success.main' : 
                               rental.status === 'à venir' ? 'info.main' : 'text.secondary',
                        textTransform: 'capitalize'
                      }}
                    >
                      {rental.status}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {rental.amount.toLocaleString('fr-FR')}€
                  </TableCell>
                </TableRow>
              ))}
              {dashboardData.currentRentals.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Aucune location en cours
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default DashboardPage;