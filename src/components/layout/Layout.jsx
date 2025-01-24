import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, CssBaseline, Drawer, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Header from './Header';
import BottomNavigation from './BottomNavigation';
import DrawerMenu from './DrawerMenu';

const Layout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
      
      <Header onMenuClick={() => setIsDrawerOpen(true)} />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 2,
          pb: isMobile ? 7 : 2, // Espace pour la navigation du bas sur mobile
          width: '100%',
          maxWidth: '100%',
          overflow: 'hidden'
        }}
      >
        <Outlet />
      </Box>

      {isMobile && <BottomNavigation />}

      <Drawer
        anchor="left"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            width: '85%',
            maxWidth: 360
          }
        }}
      >
        <DrawerMenu onClose={() => setIsDrawerOpen(false)} />
      </Drawer>
    </Box>
  );
};

export default Layout;