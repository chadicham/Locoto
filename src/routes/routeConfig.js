import {
    Dashboard as DashboardIcon,
    DirectionsCar as VehiclesIcon,
    Description as ContractsIcon,
    AccountCircle as ProfileIcon,
    CreditCard as SubscriptionIcon,
    Notifications as NotificationsIcon
  } from '@mui/icons-material';
  
  export const routes = {
    dashboard: {
      path: '/',
      label: 'Tableau de bord',
      icon: DashboardIcon
    },
    vehicles: {
      path: '/vehicles',
      label: 'Véhicules',
      icon: VehiclesIcon
    },
    contracts: {
      path: '/contracts',
      label: 'Contrats',
      icon: ContractsIcon
    },
    profile: {
      path: '/profile',
      label: 'Profil',
      icon: ProfileIcon
    },
    subscription: {
      path: '/subscription',
      label: 'Abonnement',
      icon: SubscriptionIcon
    },
    notifications: {
      path: '/notifications',
      label: 'Notifications',
      icon: NotificationsIcon
    }
  };
  
  export const getRouteByPath = (path) => {
    return Object.values(routes).find(route => route.path === path);
  };
  
  export default routes;