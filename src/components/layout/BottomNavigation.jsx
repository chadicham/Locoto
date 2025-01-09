import { useLocation, useNavigate } from 'react-router-dom';
import { Paper, BottomNavigation as MuiBottomNavigation, BottomNavigationAction } from '@mui/material';
import routes from '../../routes/routeConfig';

const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const mainRoutes = [
    routes.dashboard,
    routes.vehicles,
    routes.contracts,
    routes.profile
  ];

  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0,
        zIndex: 1000,
        borderTop: '1px solid',
        borderColor: 'divider'
      }} 
      elevation={3}
    >
      <MuiBottomNavigation
        value={location.pathname}
        onChange={(_, newValue) => navigate(newValue)}
        showLabels
      >
        {mainRoutes.map((route) => {
          const Icon = route.icon;
          return (
            <BottomNavigationAction 
              key={route.path}
              label={route.label}
              value={route.path}
              icon={<Icon />}
            />
          );
        })}
      </MuiBottomNavigation>
    </Paper>
  );
};

export default BottomNavigation;