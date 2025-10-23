import { GlobalStyles as MuiGlobalStyles } from '@mui/material';

const GlobalStyles = () => {
  return (
    <MuiGlobalStyles
      styles={(theme) => ({
        '*': {
          margin: 0,
          padding: 0,
          boxSizing: 'border-box',
          WebkitTapHighlightColor: 'transparent',
        },
        html: {
          width: '100%',
          height: '100%',
          WebkitOverflowScrolling: 'touch',
        },
        body: {
          width: '100%',
          height: '100%',
          backgroundColor: 'rgb(6, 0, 16)',
          background: 'linear-gradient(135deg, rgb(6, 0, 16) 0%, rgb(25, 10, 40) 50%, rgb(6, 0, 16) 100%)',
          backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(108, 99, 255, 0.08) 0%, transparent 40%), radial-gradient(circle at 80% 80%, rgba(108, 99, 255, 0.05) 0%, transparent 40%)',
          backgroundAttachment: 'fixed',
        },
        '#root': {
          width: '100%',
          height: '100%',
        },
        input: {
          '&[type=number]': {
            MozAppearance: 'textfield',
            '&::-webkit-outer-spin-button': {
              margin: 0,
              WebkitAppearance: 'none',
            },
            '&::-webkit-inner-spin-button': {
              margin: 0,
              WebkitAppearance: 'none',
            },
          },
        },
        img: {
          maxWidth: '100%',
          display: 'block',
        },
        // Scrollbar personnalisée pour navigateurs webkit
        '::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '::-webkit-scrollbar-track': {
          background: 'rgba(255, 255, 255, 0.03)',
        },
        '::-webkit-scrollbar-thumb': {
          background: 'rgba(108, 99, 255, 0.3)',
          borderRadius: '4px',
          '&:hover': {
            background: 'rgba(108, 99, 255, 0.5)',
          },
        },
        // Animations
        '@keyframes fadeIn': {
          from: {
            opacity: 0,
            transform: 'translateY(20px)',
          },
          to: {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
        '@keyframes slideIn': {
          from: {
            transform: 'translateX(-100%)',
          },
          to: {
            transform: 'translateX(0)',
          },
        },
        '@keyframes pulse': {
          '0%, 100%': {
            opacity: 1,
          },
          '50%': {
            opacity: 0.7,
          },
        },
        '.fade-in': {
          animation: 'fadeIn 0.4s ease-out',
        },
        '.touch-ripple': {
          position: 'relative',
          overflow: 'hidden',
          transform: 'translate3d(0, 0, 0)',
          '&::after': {
            content: '""',
            display: 'block',
            position: 'absolute',
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
            pointerEvents: 'none',
            backgroundColor: 'currentColor',
            opacity: 0,
            transition: 'opacity 0.3s ease-in-out',
          },
          '&:active::after': {
            opacity: 0.1,
          },
        },
        // Effet de glassmorphism
        '.glass-effect': {
          background: 'rgba(21, 25, 50, 0.7)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        // Gradient text
        '.gradient-text': {
          background: 'linear-gradient(135deg, #6C63FF 0%, #00D9C0 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        },
      })}
    />
  );
};

export default GlobalStyles;