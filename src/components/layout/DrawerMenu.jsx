import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import {
  AccountCircle,
  CreditCard,
  Notifications,
  Help,
  ExitToApp,
  Dashboard,
  DirectionsCar,
  Description
} from '@mui/icons-material';
import { clearCredentials } from '../../store/slices/authSlice';
import { useState } from 'react';

const DrawerMenu = ({ onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const handleNavigation = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = () => {
    dispatch(clearCredentials());
    setLogoutDialogOpen(false);
    navigate('/login');
    if (onClose) onClose();
  };

  const handleSupportClick = () => {
    window.open('mailto:support@locoto.com', '_blank');
    if (onClose) onClose();
  };

  return (
    <>
      <Box sx={{ width: '100%', p: 2 }}>
        <Box sx={{ pb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Menu
          </Typography>
        </Box>

        <Divider />

        {/* Nouvelles options de navigation principales */}
        <List>
          <ListItem button onClick={() => handleNavigation('/')}>
            <ListItemIcon>
              <Dashboard />
            </ListItemIcon>
            <ListItemText 
              primary="Dashboard" 
              secondary="Tableau de bord"
            />
          </ListItem>

          <ListItem button onClick={() => handleNavigation('/vehicles')}>
            <ListItemIcon>
              <DirectionsCar />
            </ListItemIcon>
            <ListItemText 
              primary="Véhicules" 
              secondary="Gestion des véhicules"
            />
          </ListItem>

          <ListItem button onClick={() => handleNavigation('/contracts')}>
            <ListItemIcon>
              <Description />
            </ListItemIcon>
            <ListItemText 
              primary="Contrats" 
              secondary="Gestion des contrats"
            />
          </ListItem>
        </List>

        <Divider />

        {/* Options de compte existantes */}
        <List>
          <ListItem button onClick={() => handleNavigation('/profile')}>
            <ListItemIcon>
              <AccountCircle />
            </ListItemIcon>
            <ListItemText 
              primary="Mon compte" 
              secondary="Gérer votre profil"
            />
          </ListItem>

          <ListItem button onClick={() => handleNavigation('/subscription')}>
            <ListItemIcon>
              <CreditCard />
            </ListItemIcon>
            <ListItemText 
              primary="Abonnement" 
              secondary="Gérer votre forfait"
            />
          </ListItem>

          <ListItem button onClick={() => handleNavigation('/notifications')}>
            <ListItemIcon>
              <Notifications />
            </ListItemIcon>
            <ListItemText 
              primary="Notifications" 
              secondary="Paramètres des alertes"
            />
          </ListItem>
        </List>

        <Divider />

        {/* Options de support et déconnexion */}
        <List>
          <ListItem button onClick={handleSupportClick}>
            <ListItemIcon>
              <Help />
            </ListItemIcon>
            <ListItemText primary="Aide et support" />
          </ListItem>

          <ListItem button onClick={handleLogoutClick} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <ExitToApp color="error" />
            </ListItemIcon>
            <ListItemText primary="Déconnexion" />
          </ListItem>
        </List>
      </Box>

      <Dialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
      >
        <DialogTitle>Confirmation de déconnexion</DialogTitle>
        <DialogContent>
          Êtes-vous sûr de vouloir vous déconnecter ?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutDialogOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleLogoutConfirm} color="error" variant="contained">
            Déconnexion
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DrawerMenu;