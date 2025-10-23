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
      monthlyRevenue: 0,
      yearlyRevenue: 0,
      monthlyContracts: 0,
      yearlyContracts: 0
    },
    currentRentals: []
  });

  useEffect(() => {
    loadDashboardData();
    loadCalendarEvents();
  }, []);

  // Recharger les statistiques quand la date sélectionnée change
  useEffect(() => {
    loadDashboardData();
  }, [selectedDate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getDashboardData(selectedDate);
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
    let backgroundColor, borderColor, color;

    switch (event.status) {
      case 'pending':
        backgroundColor = 'rgba(245, 158, 11, 0.22)'; // amber
        borderColor = '#F59E0B';
        color = '#FBBF24';
        break;
      case 'inProgress':
        backgroundColor = 'rgba(16, 185, 129, 0.22)'; // emerald
        borderColor = '#10B981';
        color = '#34D399';
        break;
      case 'completed':
        backgroundColor = 'rgba(108, 99, 255, 0.18)'; // violet
        borderColor = '#6C63FF';
        color = '#A5B4FC';
        break;
      case 'cancelled':
        backgroundColor = 'rgba(239, 68, 68, 0.20)'; // red
        borderColor = '#EF4444';
        color = '#FCA5A5';
        break;
      default:
        backgroundColor = 'rgba(59, 130, 246, 0.20)'; // blue
        borderColor = '#3B82F6';
        color = '#93C5FD';
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        color,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderRadius: '10px',
        display: 'block',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)'
      }
    };
  };

  const StatCard = ({ title, value, icon: Icon, suffix = '' }) => (
    <Card 
      sx={{
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(108, 99, 255, 0.1) 0%, rgba(0, 217, 192, 0.05) 100%)',
          pointerEvents: 'none',
        }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <Box
            sx={{
              background: 'linear-gradient(135deg, rgba(108, 99, 255, 0.2) 0%, rgba(83, 73, 230, 0.3) 100%)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              borderRadius: 3,
              p: 1.5,
              mr: 2,
              display: 'flex',
              boxShadow: '0 4px 12px rgba(108, 99, 255, 0.2)',
              border: '1px solid rgba(108, 99, 255, 0.3)',
            }}
          >
            <Icon sx={{ color: '#8B84FF', fontSize: 28 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography 
              color="text.secondary" 
              variant="body2" 
              gutterBottom
              sx={{ fontWeight: 500, letterSpacing: '0.5px' }}
            >
              {title}
            </Typography>
            <Typography 
              variant="h4" 
              component="div"
              sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(135deg, #E8EAED 0%, #9CA3AF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
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
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            mb: 1,
            fontWeight: 700,
            background: 'linear-gradient(135deg, #6C63FF 0%, #00D9C0 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Tableau de bord
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Vue d'ensemble de votre activité
        </Typography>
      </Box>

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
            title={`Revenus de ${format(selectedDate, 'MMMM yyyy', { locale: frLocale })}`}
            value={`${dashboardData.statistics.monthlyRevenue.toLocaleString('fr-FR')}`}
            suffix=" CHF"
            icon={AccountBalance}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <StatCard
            title={`Contrats de ${format(selectedDate, 'MMMM yyyy', { locale: frLocale })}`}
            value={dashboardData.statistics.monthlyContracts}
            icon={Description}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <StatCard
            title={`Revenus de l'année ${format(selectedDate, 'yyyy')}`}
            value={`${dashboardData.statistics.yearlyRevenue.toLocaleString('fr-FR')}`}
            suffix=" CHF"
            icon={AccountBalance}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <StatCard
            title={`Contrats de l'année ${format(selectedDate, 'yyyy')}`}
            value={dashboardData.statistics.yearlyContracts}
            icon={Description}
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3 
        }}>
          <Box>
            <Typography 
              variant="h5"
              sx={{ 
                fontWeight: 700,
                mb: 0.5
              }}
            >
              Aperçu du calendrier
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gérez vos locations en un coup d'œil
            </Typography>
          </Box>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={frLocale}>
            <DatePicker
              label="Aller à la date"
              value={selectedDate}
              onChange={(newDate) => {
                setSelectedDate(newDate);
              }}
              slotProps={{ 
                textField: { 
                  size: 'small',
                  sx: {
                    '& .MuiOutlinedInput-root': {
                      background: 'rgba(108, 99, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '10px',
                    }
                  }
                } 
              }}
            />
          </LocalizationProvider>
        </Box>
        <Card sx={{ 
          backgroundColor: 'background.paper',
          '& .rbc-calendar': {
            background: 'transparent'
          }
        }}>
          <CardContent sx={{ p: 3 }}>
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