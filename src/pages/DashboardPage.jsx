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

const DashboardPage = () => {
 const navigate = useNavigate();
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);
 const [events, setEvents] = useState([]);
 const [calendarLoading, setCalendarLoading] = useState(true);
 const [selectedDate, setSelectedDate] = useState(new Date());
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

 const handleRentalClick = (rentalId) => {
   navigate(`/contracts/${rentalId}`);
 };

 const eventStyleGetter = (event) => {
   let backgroundColor;
   switch (event.status) {
     case 'pending':
       backgroundColor = '#FFA726';
       break;
     case 'confirmed':
       backgroundColor = '#66BB6A';
       break;
     case 'inProgress':
       backgroundColor = '#42A5F5';
       break;
     case 'completed':
       backgroundColor = '#78909C';
       break;
     case 'cancelled':
       backgroundColor = '#EF5350';
       break;
     default:
       backgroundColor = '#2E5BFF';
   }
   return {
     style: {
       backgroundColor,
       borderRadius: '4px',
       opacity: 0.8,
       color: 'white',
       border: 'none',
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
               popup
               onSelectEvent={(event) => handleRentalClick(event.id)}
             />
           </Box>
         </CardContent>
       </Card>
     </Box>
   </Box>
 );
};

export default DashboardPage;