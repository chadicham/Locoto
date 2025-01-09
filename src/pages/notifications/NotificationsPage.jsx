import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  Divider,
  IconButton,
  Badge,
  Tab,
  Tabs
} from '@mui/material';
import {
  NotificationsActive,
  DirectionsCar,
  Description,
  Payment,
  Delete
} from '@mui/icons-material';

const NotificationsPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [settings, setSettings] = useState({
    newRental: true,
    contractEnd: true,
    payment: true,
    maintenance: false
  });

  const notifications = [
    {
      id: 1,
      title: "Fin de location proche",
      message: "La location de la Renault Clio se termine dans 2 jours",
      date: "2024-01-07",
      type: "contract",
      isRead: false
    },
    {
      id: 2,
      title: "Paiement reçu",
      message: "Le paiement de 350€ a été reçu pour la location de la Peugeot 208",
      date: "2024-01-06",
      type: "payment",
      isRead: true
    }
  ];

  const handleSettingChange = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleDeleteNotification = (id) => {
    // Ici nous ajouterons la logique de suppression
    console.log('Suppression de la notification:', id);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'contract':
        return <Description color="primary" />;
      case 'payment':
        return <Payment color="success" />;
      default:
        return <NotificationsActive />;
    }
  };

  return (
    <Box sx={{ p: 2, pb: 8 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Notifications
      </Typography>

      <Tabs 
        value={activeTab} 
        onChange={(_, newValue) => setActiveTab(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab 
          label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              Notifications
              <Badge 
                badgeContent={notifications.filter(n => !n.isRead).length} 
                color="error" 
                sx={{ ml: 1 }}
              />
            </Box>
          } 
        />
        <Tab label="Paramètres" />
      </Tabs>

      {activeTab === 0 ? (
        <Paper>
          <List>
            {notifications.length > 0 ? (
              notifications.map((notification, index) => (
                <Box key={notification.id}>
                  <ListItem
                    sx={{
                      bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                      transition: 'background-color 0.2s'
                    }}
                    secondaryAction={
                      <IconButton 
                        edge="end" 
                        onClick={() => handleDeleteNotification(notification.id)}
                      >
                        <Delete />
                      </IconButton>
                    }
                  >
                    <ListItemIcon>
                      {getNotificationIcon(notification.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={notification.title}
                      secondary={
                        <>
                          <Typography variant="body2" component="span" color="text.secondary">
                            {notification.message}
                          </Typography>
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            {new Date(notification.date).toLocaleDateString()}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  {index < notifications.length - 1 && <Divider />}
                </Box>
              ))
            ) : (
              <ListItem>
                <ListItemText 
                  primary="Aucune notification"
                  secondary="Vous n'avez pas de nouvelles notifications"
                />
              </ListItem>
            )}
          </List>
        </Paper>
      ) : (
        <Paper>
          <List>
            <ListItem>
              <ListItemIcon>
                <DirectionsCar />
              </ListItemIcon>
              <ListItemText 
                primary="Nouvelles locations"
                secondary="Notifications pour les nouvelles demandes de location"
              />
              <Switch
                edge="end"
                checked={settings.newRental}
                onChange={() => handleSettingChange('newRental')}
              />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemIcon>
                <Description />
              </ListItemIcon>
              <ListItemText 
                primary="Fin de contrats"
                secondary="Notifications pour les contrats qui arrivent à échéance"
              />
              <Switch
                edge="end"
                checked={settings.contractEnd}
                onChange={() => handleSettingChange('contractEnd')}
              />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemIcon>
                <Payment />
              </ListItemIcon>
              <ListItemText 
                primary="Paiements"
                secondary="Notifications pour les paiements reçus"
              />
              <Switch
                edge="end"
                checked={settings.payment}
                onChange={() => handleSettingChange('payment')}
              />
            </ListItem>
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default NotificationsPage;