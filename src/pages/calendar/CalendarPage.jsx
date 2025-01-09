import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Tooltip,
  IconButton
} from '@mui/material';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import RentalService from '../../services/rentalService';
import RentalDetailsDialog from '../../components/rentals/RentalDetailsDialog';

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

const CalendarPage = () => {
  const [selectedVehicle, setSelectedVehicle] = useState('all');
  const [events, setEvents] = useState([]);
  const [selectedRentalId, setSelectedRentalId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    loadVehicles();
    loadRentals();
  }, []);

  useEffect(() => {
    loadRentals(selectedVehicle !== 'all' ? selectedVehicle : null);
  }, [selectedVehicle]);

  const loadVehicles = async () => {
    try {
      // À remplacer par votre appel API réel
      const response = await fetch('/api/vehicles');
      const data = await response.json();
      setVehicles(data);
    } catch (error) {
      console.error('Erreur lors du chargement des véhicules:', error);
    }
  };

  const loadRentals = async (vehicleId = null) => {
    try {
      setLoading(true);
      const rentals = await RentalService.fetchRentals(vehicleId);
      setEvents(rentals);
    } catch (error) {
      console.error('Erreur lors du chargement des locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const eventStyleGetter = (event) => {
    let backgroundColor;
    let borderColor;

    switch (event.status) {
      case 'pending':
        backgroundColor = '#FFA726';
        borderColor = '#F57C00';
        break;
      case 'confirmed':
        backgroundColor = '#66BB6A';
        borderColor = '#388E3C';
        break;
      case 'inProgress':
        backgroundColor = '#42A5F5';
        borderColor = '#1976D2';
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
        backgroundColor = '#2E5BFF';
        borderColor = '#1939B7';
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

  const EventComponent = ({ event }) => (
    <Tooltip 
      title={`${event.renterName} - ${format(event.start, 'dd/MM')} au ${format(event.end, 'dd/MM')}`}
      arrow
    >
      <Box sx={{ p: 1 }}>
        <Typography variant="subtitle2" noWrap>
          {event.title}
        </Typography>
        <Typography variant="caption" display="block" noWrap>
          {event.renterName}
        </Typography>
      </Box>
    </Tooltip>
  );

  const handleEventClick = (event) => {
    setSelectedRentalId(event.id);
  };

  const handleRefresh = () => {
    loadRentals(selectedVehicle !== 'all' ? selectedVehicle : null);
  };

  return (
    <Box sx={{ p: 2, height: 'calc(100vh - 100px)' }}>
      <Box sx={{ 
        mb: 3, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Typography variant="h5" fontWeight="600">
          Calendrier des locations
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Véhicule</InputLabel>
            <Select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              label="Véhicule"
            >
              <MenuItem value="all">Tous les véhicules</MenuItem>
              {vehicles.map(vehicle => (
                <MenuItem key={vehicle.id} value={vehicle.id}>
                  {vehicle.brand} {vehicle.model} - {vehicle.licensePlate}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <IconButton onClick={handleRefresh} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Légende
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip size="small" label="En attente" sx={{ bgcolor: '#FFA726', color: 'white' }} />
          <Chip size="small" label="Confirmée" sx={{ bgcolor: '#66BB6A', color: 'white' }} />
          <Chip size="small" label="En cours" sx={{ bgcolor: '#42A5F5', color: 'white' }} />
          <Chip size="small" label="Terminée" sx={{ bgcolor: '#78909C', color: 'white' }} />
          <Chip size="small" label="Annulée" sx={{ bgcolor: '#EF5350', color: 'white' }} />
        </Box>
      </Box>

      <Card sx={{ height: 'calc(100% - 120px)' }}>
        <CardContent sx={{ height: '100%', p: '16px !important' }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            views={['month', 'week', 'day']}
            defaultView="month"
            messages={{
              today: "Aujourd'hui",
              previous: 'Précédent',
              next: 'Suivant',
              month: 'Mois',
              week: 'Semaine',
              day: 'Jour',
              agenda: 'Agenda',
              date: 'Date',
              time: 'Heure',
              event: 'Événement',
              noEventsInRange: 'Aucune location sur cette période'
            }}
            eventPropGetter={eventStyleGetter}
            components={{
              event: EventComponent
            }}
            onSelectEvent={handleEventClick}
            popup
            selectable
            onSelecting={() => false} // Désactive la sélection de plage
          />
        </CardContent>
      </Card>

      <RentalDetailsDialog
        open={!!selectedRentalId}
        onClose={() => setSelectedRentalId(null)}
        rentalId={selectedRentalId}
      />
    </Box>
  );
};

export default CalendarPage;