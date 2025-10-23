import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6C63FF',
      light: '#8B84FF',
      dark: '#5349E6',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#00D9C0',
      light: '#33E3CE',
      dark: '#00B8A3',
      contrastText: '#000000',
    },
    background: {
      default: 'rgb(6, 0, 16)',
      paper: 'rgb(15, 8, 26)',
    },
    surface: {
      main: '#1E2139',
      light: '#252A43',
      dark: '#151932',
    },
    text: {
      primary: '#E8EAED',
      secondary: '#9CA3AF',
      disabled: '#6B7280',
    },
    success: {
      main: '#10B981',
      light: '#34D399',
      dark: '#059669',
    },
    error: {
      main: '#EF4444',
      light: '#F87171',
      dark: '#DC2626',
    },
    warning: {
      main: '#F59E0B',
      light: '#FBBF24',
      dark: '#D97706',
    },
    info: {
      main: '#3B82F6',
      light: '#60A5FA',
      dark: '#2563EB',
    },
    divider: 'rgba(255, 255, 255, 0.08)',
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
      '@media (min-width:600px)': {
        fontSize: '2.5rem',
      },
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
      '@media (min-width:600px)': {
        fontSize: '2rem',
      },
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
      '@media (min-width:600px)': {
        fontSize: '1.75rem',
      },
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
      '@media (min-width:600px)': {
        fontSize: '1.5rem',
      },
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0, 0, 0, 0.2)',
    '0px 4px 8px rgba(0, 0, 0, 0.25)',
    '0px 8px 16px rgba(0, 0, 0, 0.3)',
    '0px 12px 24px rgba(0, 0, 0, 0.35)',
    '0px 16px 32px rgba(0, 0, 0, 0.4)',
    '0px 20px 40px rgba(0, 0, 0, 0.45)',
    '0px 24px 48px rgba(0, 0, 0, 0.5)',
    // Ajout des ombres restantes (MUI en nécessite 25)
    '0px 2px 4px rgba(0, 0, 0, 0.2)',
    '0px 4px 8px rgba(0, 0, 0, 0.25)',
    '0px 8px 16px rgba(0, 0, 0, 0.3)',
    '0px 12px 24px rgba(0, 0, 0, 0.35)',
    '0px 16px 32px rgba(0, 0, 0, 0.4)',
    '0px 20px 40px rgba(0, 0, 0, 0.45)',
    '0px 24px 48px rgba(0, 0, 0, 0.5)',
    '0px 2px 4px rgba(0, 0, 0, 0.2)',
    '0px 4px 8px rgba(0, 0, 0, 0.25)',
    '0px 8px 16px rgba(0, 0, 0, 0.3)',
    '0px 12px 24px rgba(0, 0, 0, 0.35)',
    '0px 16px 32px rgba(0, 0, 0, 0.4)',
    '0px 20px 40px rgba(0, 0, 0, 0.45)',
    '0px 24px 48px rgba(0, 0, 0, 0.5)',
    '0px 2px 4px rgba(0, 0, 0, 0.2)',
    '0px 4px 8px rgba(0, 0, 0, 0.25)',
    '0px 8px 16px rgba(0, 0, 0, 0.3)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 20px',
          minHeight: '44px',
          transition: 'all 0.2s ease-in-out',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #6C63FF 0%, #5349E6 100%)',
          boxShadow: '0 4px 12px rgba(108, 99, 255, 0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #5349E6 0%, #4239CC 100%)',
            boxShadow: '0 6px 20px rgba(108, 99, 255, 0.4)',
            transform: 'translateY(-2px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #00D9C0 0%, #00B8A3 100%)',
          boxShadow: '0 4px 12px rgba(0, 217, 192, 0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #00B8A3 0%, #009688 100%)',
            boxShadow: '0 6px 20px rgba(0, 217, 192, 0.4)',
            transform: 'translateY(-2px)',
          },
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
            backgroundColor: 'rgba(108, 99, 255, 0.08)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '20px',
          background: 'rgba(15, 8, 26, 0.7)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          backgroundImage: 'none',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(108, 99, 255, 0.15)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 12px 40px 0 rgba(108, 99, 255, 0.3)',
            transform: 'translateY(-4px)',
            border: '1px solid rgba(108, 99, 255, 0.25)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          background: 'rgba(15, 8, 26, 0.7)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(108, 99, 255, 0.12)',
        },
        elevation1: {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        },
        elevation2: {
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(15, 8, 26, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          backgroundImage: 'none',
          borderBottom: '1px solid rgba(108, 99, 255, 0.15)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          height: '64px',
          background: 'rgba(15, 8, 26, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(108, 99, 255, 0.15)',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.4)',
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          padding: '8px 0',
          minWidth: '64px',
          color: '#9CA3AF',
          '&.Mui-selected': {
            color: '#6C63FF',
          },
        },
        label: {
          fontSize: '0.75rem',
          fontWeight: 500,
          '&.Mui-selected': {
            fontSize: '0.75rem',
            fontWeight: 600,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'rgba(108, 99, 255, 0.3)',
            },
            '&.Mui-focused': {
              background: 'rgba(255, 255, 255, 0.07)',
              boxShadow: '0 0 0 2px rgba(108, 99, 255, 0.1)',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: '8px',
        },
        filled: {
          backgroundColor: 'rgba(108, 99, 255, 0.15)',
          color: '#8B84FF',
          border: '1px solid rgba(108, 99, 255, 0.3)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'rgba(15, 8, 26, 0.9)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(108, 99, 255, 0.15)',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(255, 255, 255, 0.08)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          margin: '2px 8px',
          '&:hover': {
            backgroundColor: 'rgba(108, 99, 255, 0.08)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(108, 99, 255, 0.15)',
            '&:hover': {
              backgroundColor: 'rgba(108, 99, 255, 0.2)',
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '20px',
          background: 'rgba(15, 8, 26, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(108, 99, 255, 0.2)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, rgba(108, 99, 255, 0.15) 0%, rgba(0, 217, 192, 0.1) 100%)',
          borderBottom: '1px solid rgba(108, 99, 255, 0.2)',
          fontWeight: 700,
        },
      },
    },
  },
});

export default theme;