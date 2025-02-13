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
  const drawerWidth = 240;

  return (
    <Box sx={{ 
      display: 'flex',
      minHeight: '100vh',
      width: '100%'
    }}>
      <CssBaseline />
      
      <Header 
        onMenuClick={() => setIsDrawerOpen(true)} 
        showMenuIcon={isMobile}
      />
      
      {/* Drawer mobile */}
      <Drawer
        variant="temporary"
        anchor="left"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            width: '85%',
            maxWidth: 360,
            backgroundColor: 'background.paper',
            borderRight: '1px solid',
            borderColor: 'divider'
          }
        }}
      >
        <DrawerMenu onClose={() => setIsDrawerOpen(false)} isPermanent={false} />
      </Drawer>

      {/* Drawer tablette/desktop */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
            mt: `${theme.mixins.toolbar.minHeight}px`,
            height: `calc(100vh - ${theme.mixins.toolbar.minHeight}px)`
          }
        }}
      >
        <DrawerMenu isPermanent={true} />
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex', // Ajout
          flexDirection: 'column', // Ajout
          width: '100%', // Modification
          ml: { sm: `${drawerWidth}px` },
          mt: `${theme.mixins.toolbar.minHeight}px`,
          height: `calc(100vh - ${theme.mixins.toolbar.minHeight}px)`,
          overflow: 'auto',
          backgroundColor: 'background.default'
        }}
      >
        <Box sx={{
          p: { xs: 2, sm: 3 },
          width: '100%', // Ajout
          maxWidth: '1200px',
          margin: '0 auto',
          minHeight: `calc(100vh - ${theme.mixins.toolbar.minHeight}px - ${isMobile ? '56px' : '0px'})`,
          pb: isMobile ? 7 : 3,
          flexGrow: 1 // Ajout
        }}>
          <Outlet />
        </Box>
      </Box>

      {isMobile && <BottomNavigation />}
    </Box>
  );
};

export default Layout;