import { 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon, 
  ListItemSecondaryAction,
  Box, 
  Typography, 
  Divider 
} from '@mui/material';

const MobileList = ({ 
  items, 
  onItemClick,
  emptyMessage = "Aucun élément à afficher",
  maxWidth
}) => {
  if (!items?.length) {
    return (
      <Box 
        sx={{ 
          py: { xs: 4, sm: 6 },
          textAlign: 'center',
          color: 'text.secondary',
          maxWidth: maxWidth || { sm: '600px', md: '800px' },
          margin: '0 auto'
        }}
      >
        <Typography 
          variant="body1"
          sx={{
            fontSize: { xs: '1rem', sm: '1.125rem' }
          }}
        >
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  return (
    <List
      sx={{
        width: '100%',
        maxWidth: maxWidth || { sm: '600px', md: '800px' },
        margin: '0 auto',
        bgcolor: 'background.paper',
        borderRadius: { xs: 2, sm: 3 },
        overflow: 'hidden',
        boxShadow: { 
          xs: 'none', 
          sm: '0 2px 8px rgba(0,0,0,0.1)' 
        }
      }}
    >
      {items.map((item, index) => (
        <Box key={item.id || index}>
          <ListItem
            button={!!onItemClick}
            onClick={() => onItemClick?.(item)}
            sx={{
              py: { xs: 2, sm: 3 },
              px: { xs: 2, sm: 3 },
              '&:hover': {
                backgroundColor: 'action.hover',
              },
              '&:active': {
                backgroundColor: 'action.selected',
              },
              pr: item.actions ? { xs: 8, sm: 10 } : { xs: 2, sm: 3 },
              transition: 'background-color 0.2s'
            }}
          >
            {item.icon && (
              <ListItemIcon sx={{ 
                minWidth: { xs: 40, sm: 48 },
                '& > *': {
                  fontSize: { xs: '1.5rem', sm: '1.75rem' }
                }
              }}>
                {item.icon}
              </ListItemIcon>
            )}
            <ListItemText
              primary={
                <Typography 
                  variant="subtitle1" 
                  fontWeight={500}
                  sx={{
                    fontSize: { xs: '1rem', sm: '1.125rem' }
                  }}
                >
                  {item.primary}
                </Typography>
              }
              secondary={
                <Typography 
                  component="div" 
                  variant="body2"
                  sx={{
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}
                >
                  <Box sx={{ mt: { xs: 1, sm: 1.5 } }}>
                    {item.secondaryContent}
                    {item.status && (
                      <Box 
                        sx={{ 
                          display: 'inline-block',
                          px: { xs: 1, sm: 1.5 },
                          py: { xs: 0.5, sm: 0.75 },
                          borderRadius: { xs: 1, sm: 1.5 },
                          bgcolor: `${item.status.color}15`,
                          color: item.status.color,
                          mt: { xs: 1, sm: 1.5 }
                        }}
                      >
                        <Typography 
                          variant="caption"
                          sx={{
                            fontSize: { xs: '0.75rem', sm: '0.875rem' }
                          }}
                        >
                          {item.status.label}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Typography>
              }
            />
            {item.actions && (
              <ListItemSecondaryAction sx={{
                right: { xs: 8, sm: 16 }
              }}>
                {item.actions}
              </ListItemSecondaryAction>
            )}
          </ListItem>
          {index < items.length - 1 && (
            <Divider sx={{
              mx: { sm: 2 }
            }} />
          )}
        </Box>
      ))}
    </List>
  );
};

export default MobileList;