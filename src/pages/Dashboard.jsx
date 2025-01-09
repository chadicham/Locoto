import { Box, Typography, Card, CardContent, useTheme } from '@mui/material';
import { DirectionsCar, Description, AccountBalance } from '@mui/icons-material';

const StatCard = ({ title, value, icon, color }) => (
  <Card 
    sx={{ 
      mb: 2,
      borderRadius: 2,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}
  >
    <CardContent>
      <Box display="flex" alignItems="center">
        <Box 
          sx={{ 
            backgroundColor: `${color}15`, 
            p: 1.5, 
            borderRadius: 2,
            mr: 2
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h6">
            {value}
          </Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const theme = useTheme();

  return (
    <Box sx={{ maxWidth: '100%', px: 1 }}>
      <Typography 
        variant="h5" 
        sx={{ 
          mb: 3,
          fontWeight: 600,
          fontSize: { xs: '1.5rem', sm: '2rem' }
        }}
      >
        Tableau de bord
      </Typography>
      
      <StatCard 
        title="Véhicules" 
        value="3" 
        icon={<DirectionsCar sx={{ color: theme.palette.primary.main }} />}
        color={theme.palette.primary.main}
      />
      
      <StatCard 
        title="Contrats" 
        value="12" 
        icon={<Description sx={{ color: theme.palette.secondary.main }} />}
        color={theme.palette.secondary.main}
      />
      
      <StatCard 
        title="Revenus" 
        value="2850 €" 
        icon={<AccountBalance sx={{ color: theme.palette.success.main }} />}
        color={theme.palette.success.main}
      />
    </Box>
  );
};

export default Dashboard;