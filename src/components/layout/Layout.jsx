import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, CssBaseline, Drawer, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Header from './Header';
import BottomNavigation from './BottomNavigation';
import DrawerMenu from './DrawerMenu';

const DRAWER_WIDTH = 280; // Largeur du drawer permanent

const Layout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        minHeight: '100vh',
        backgroundColor: 'background.default' 
      }}
    >
      <CssBaseline />
      
      <Header onMenuClick={() => setIsDrawerOpen(true)} isMobile={isMobile} />
      
      {/* Drawer permanent pour desktop/tablet */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              marginTop: `${theme.mixins.toolbar.minHeight}px`,
              height: `calc(100vh - ${theme.mixins.toolbar.minHeight}px)`,
              backgroundColor: 'background.paper'
            },
          }}
        >
          <DrawerMenu />
        </Drawer>
      )}

      {/* Drawer mobile */}
      <Drawer
        anchor="left"
        open={isDrawerOpen && isMobile}
        onClose={() => setIsDrawerOpen(false)}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            width: '85%',
            maxWidth: 360,
            backgroundColor: 'background.paper'
          }
        }}
      >
        <DrawerMenu onClose={() => setIsDrawerOpen(false)} />
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 2,
          pb: isMobile ? 7 : 2,
          width: isMobile ? '100%' : `calc(100% - ${DRAWER_WIDTH}px)`,
          maxWidth: '100%',
          backgroundColor: 'background.default',
          overflowY: 'auto',
          height: `calc(100vh - ${theme.mixins.toolbar.minHeight}px)`,
          mt: `${theme.mixins.toolbar.minHeight}px`,
          ml: !isMobile ? `${DRAWER_WIDTH}px` : 0
        }}
      >
        <Outlet />
      </Box>

      {isMobile && <BottomNavigation />}
    </Box>
  );
};

export default Layout;