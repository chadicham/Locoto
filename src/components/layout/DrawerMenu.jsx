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
  ExitToApp
} from '@mui/icons-material';
import { clearCredentials } from '../../store/slices/authSlice';
import { useState } from 'react';

const DrawerMenu = ({ onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  const handleProfileClick = () => handleNavigation('/profile');

  const handleSubscriptionClick = () => handleNavigation('/subscription');

  const handleNotificationsClick = () => handleNavigation('/notifications');

  const handleSupportClick = () => {
    window.open('mailto:support@locoto.com', '_blank');
    onClose();
  };

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = () => {
    dispatch(clearCredentials());
    setLogoutDialogOpen(false);
    navigate('/login');
    onClose();
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

        <List>
          <ListItem button onClick={handleProfileClick}>
            <ListItemIcon>
              <AccountCircle />
            </ListItemIcon>
            <ListItemText 
              primary="Mon compte" 
              secondary="Gérer votre profil"
            />
          </ListItem>

          <ListItem button onClick={handleSubscriptionClick}>
            <ListItemIcon>
              <CreditCard />
            </ListItemIcon>
            <ListItemText 
              primary="Abonnement" 
              secondary="Gérer votre forfait"
            />
          </ListItem>

          <ListItem button onClick={handleNotificationsClick}>
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