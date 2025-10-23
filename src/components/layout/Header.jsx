import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Avatar,
  Menu,
  MenuItem,
  Box,
  useTheme,
  useMediaQuery
} from '@mui/material';
import Logo from '../common/Logo';
import { Menu as MenuIcon, Notifications, KeyboardArrowDown } from '@mui/icons-material';
import { clearCredentials } from '../../store/slices/authSlice';

const Header = ({ onMenuClick }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState(null);
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationsOpen = (event) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleLogout = () => {
    dispatch(clearCredentials());
    setAnchorEl(null);
    navigate('/login');
  };

  const getInitials = () => {
    if (!user) return '';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`;
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: 'rgba(15, 8, 26, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        color: 'text.primary',
        borderBottom: '1px solid rgba(108, 99, 255, 0.2)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.4)',
      }}
      elevation={0}
    >
      <Toolbar>
        {isMobile && (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={onMenuClick}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 1, ml: !isMobile ? 2 : 0 }}>
          <Logo variant={isMobile ? 'mark' : 'full'} height={isMobile ? 28 : 32} hoverGlow />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton 
            color="inherit"
            onClick={handleNotificationsOpen}
            sx={{
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                background: 'rgba(108, 99, 255, 0.15)',
                transform: 'scale(1.05)',
              }
            }}
          >
            <Notifications />
          </IconButton>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              ml: 1,
              px: 1.5,
              py: 0.5,
              borderRadius: '12px',
              background: 'rgba(108, 99, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(108, 99, 255, 0.2)',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                background: 'rgba(108, 99, 255, 0.15)',
                transform: 'scale(1.02)',
              }
            }}
            onClick={handleProfileMenuOpen}
          >
            <Avatar 
              sx={{ 
                width: 32, 
                height: 32,
                background: 'linear-gradient(135deg, #6C63FF 0%, #5349E6 100%)',
                boxShadow: '0 4px 12px rgba(108, 99, 255, 0.4)',
              }}
            >
              {getInitials()}
            </Avatar>
            <KeyboardArrowDown sx={{ fontSize: 20 }} />
          </Box>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem onClick={() => {
            setAnchorEl(null);
            navigate('/profile');
          }}>Mon profil</MenuItem>
          <MenuItem onClick={() => {
            setAnchorEl(null);
            navigate('/settings');
          }}>Paramètres</MenuItem>
          <MenuItem onClick={handleLogout}>Déconnexion</MenuItem>
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