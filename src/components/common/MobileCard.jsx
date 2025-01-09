import { Card, CardContent, Box, Typography, IconButton } from '@mui/material';
import { ChevronRight } from '@mui/icons-material';

const MobileCard = ({ 
  title, 
  subtitle, 
  icon: Icon, 
  onClick, 
  children,
  action 
}) => {
  return (
    <Card
      sx={{
        mb: 2,
        borderRadius: 2,
        cursor: onClick ? 'pointer' : 'default',
        '&:active': onClick && {
          transform: 'scale(0.98)',
          transition: 'transform 0.1s',
        }
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {Icon && (
            <Box
              sx={{
                mr: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: 1,
                backgroundColor: 'primary.light',
                color: 'primary.main',
              }}
            >
              <Icon />
            </Box>
          )}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight="600">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          {action || (onClick && <ChevronRight color="action" />)}
        </Box>
        {children && (
          <Box sx={{ mt: 2 }}>
            {children}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default MobileCard;