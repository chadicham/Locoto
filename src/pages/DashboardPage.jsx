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
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import frLocale from 'date-fns/locale/fr';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import dashboardService from '../services/dashboardService';
import RentalService from '../services/rentalService';

const locales = {
  'fr': fr
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales
});

const EventComponent = ({ event }) => (
  <Box sx={{ p: 1 }}>
    <Typography variant="subtitle2" noWrap>
      {event.title}
    </Typography>
    <Typography variant="caption" display="block" noWrap>
      {event.renterName}
    </Typography>
  </Box>
);
const DashboardPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]);
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedContract, setSelectedContract] = useState(null);
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
    loadCalendarEvents();
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

  const loadCalendarEvents = async () => {
    try {
      setCalendarLoading(true);
      const rentals = await RentalService.fetchRentals();
      setEvents(rentals);
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error);
    } finally {
      setCalendarLoading(false);
    }
  };

  const handleRentalClick = async (rentalId) => {
    try {
      const contractDetails = await RentalService.getContractById(rentalId);
      setSelectedContract(contractDetails);
    } catch (error) {
      console.error('Erreur lors du chargement des détails du contrat:', error);
      setError('Impossible de charger les détails du contrat');
    }
  };

  const eventStyleGetter = (event) => {
    let backgroundColor, borderColor;
    
    switch (event.status) {
      case 'pending':
        backgroundColor = '#FFA726';
        borderColor = '#F57C00';
        break;
      case 'inProgress':
        backgroundColor = '#66BB6A';
        borderColor = '#388E3C';
        break;
      case 'completed':
        backgroundColor = '#78909C';
        borderColor = '#455A64';
        break;
      case 'cancelled':
        backgroundColor = '#EF5350';
        borderColor = '#D32F2F';
        break;
      default:
        backgroundColor = '#42A5F5';
        borderColor = '#1976D2';
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        borderWidth: '2px',
        borderStyle: 'solid',
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        display: 'block'
      }
    };
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
            title="Revenus du mois"
            value={`${dashboardData.statistics.monthlyRevenue.toLocaleString('fr-FR')}`}
            suffix=" CHF"
            icon={AccountBalance}
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2 
        }}>
          <Typography variant="h6">
            Aperçu du calendrier
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={frLocale}>
            <DatePicker
              label="Aller à la date"
              value={selectedDate}
              onChange={(newDate) => {
                setSelectedDate(newDate);
              }}
              slotProps={{ textField: { size: 'small' } }}
            />
          </LocalizationProvider>
        </Box>
        <Card sx={{ backgroundColor: 'background.paper' }}>
          <CardContent>
            <Box sx={{ height: '500px' }}>
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                views={['month']}
                defaultView="month"
                date={selectedDate}
                onNavigate={date => setSelectedDate(date)}
                messages={{
                  today: "Aujourd'hui",
                  previous: 'Précédent',
                  next: 'Suivant',
                  month: 'Mois',
                  noEventsInRange: 'Aucune location sur cette période'
                }}
                eventPropGetter={eventStyleGetter}
                components={{
                  event: EventComponent
                }}
                popup
                tooltipAccessor={(event) => `${event.renterName} - ${format(event.start, 'dd/MM')} au ${format(event.end, 'dd/MM')}`}
                onSelectEvent={(event) => handleRentalClick(event.id)}
              />
            </Box>
          </CardContent>
        </Card>

        {selectedContract && (
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Détails du contrat</Typography>
                <Button 
                  size="small" 
                  onClick={() => setSelectedContract(null)}
                >
                  Fermer
                </Button>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Véhicule
                  </Typography>
                  <Typography>
                    {selectedContract.vehicle.brand} {selectedContract.vehicle.model}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Locataire
                  </Typography>
                  <Typography>
                    {selectedContract.renter.firstName} {selectedContract.renter.lastName}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Période
                  </Typography>
                  <Typography>
                    Du {format(new Date(selectedContract.rental.startDate), 'dd/MM/yyyy')} au {format(new Date(selectedContract.rental.endDate), 'dd/MM/yyyy')}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Montant
                    </Typography>
                    <Typography>
                      {selectedContract.rental.totalAmount?.toLocaleString('fr-FR')} CHF
                    </Typography>
                  </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Kilométrage initial
                  </Typography>
                  <Typography>
                    {selectedContract.rental.initialMileage} km
                  </Typography>
                </Grid>
                
              </Grid>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button 
                    variant="contained" 
                    size="small"
                    onClick={() => navigate('/contracts')}
                  >
                    Voir les contrats
                  </Button>
                </Box>
            </CardContent>
          </Card>
        )}

        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 16, height: 16, borderRadius: 1, backgroundColor: '#FFA726', mr: 1 }} />
            <Typography variant="caption">À venir</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 16, height: 16, borderRadius: 1, backgroundColor: '#66BB6A', mr: 1 }} />
            <Typography variant="caption">En cours</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 16, height: 16, borderRadius: 1, backgroundColor: '#78909C', mr: 1 }} />
            <Typography variant="caption">Terminée</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardPage;