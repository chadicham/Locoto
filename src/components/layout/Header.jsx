import { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Avatar,
  Menu,
  MenuItem,
  Box
} from '@mui/material';
import { Menu as MenuIcon, Notifications, KeyboardArrowDown } from '@mui/icons-material';

const Header = ({ onMenuClick }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState(null);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationsOpen = (event) => {
    setNotificationsAnchor(event.currentTarget);
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'background.paper',
        color: 'text.primary'
      }}
      elevation={1}
    >
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={onMenuClick}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Typography
          variant="h6"
          component="div"
          sx={{ 
            flexGrow: 1,
            fontWeight: 600,
            fontSize: { xs: '1.125rem', sm: '1.25rem' }
          }}
        >
          Locoto
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            color="inherit"
            onClick={handleNotificationsOpen}
          >
            <Notifications />
          </IconButton>

          <IconButton 
            onClick={handleProfileMenuOpen}
            sx={{ ml: 1 }}
          >
            <Avatar 
              sx={{ 
                width: 32, 
                height: 32,
                backgroundColor: 'primary.main'
              }}
            >
              CM
            </Avatar>
            <KeyboardArrowDown sx={{ ml: 0.5 }} />
          </IconButton>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem onClick={() => setAnchorEl(null)}>Mon profil</MenuItem>
          <MenuItem onClick={() => setAnchorEl(null)}>Paramètres</MenuItem>
          <MenuItem onClick={() => setAnchorEl(null)}>Déconnexion</MenuItem>
        </Menu>

        <Menu
          anchorEl={notificationsAnchor}
          open={Boolean(notificationsAnchor)}
          onClose={() => setNotificationsAnchor(null)}
        >
          <MenuItem>Pas de nouvelles notifications</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;