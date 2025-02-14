import React from 'react';
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
  emptyMessage = "Aucun élément à afficher" 
}) => {
  if (!items?.length) {
    return (
      <Box 
        sx={{ 
          py: 4, 
          textAlign: 'center',
          color: 'text.secondary'
        }}
      >
        <Typography variant="body1">
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  return (
    <List
      sx={{
        width: '100%',
        bgcolor: 'background.paper',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      {items.map((item, index) => (
        <Box key={item.id || index}>
          <ListItem
            button={!!onItemClick}
            onClick={() => onItemClick?.(item)}
            sx={{
              py: 2,
              '&:active': {
                backgroundColor: 'action.selected',
              },
              pr: item.actions ? 8 : 2, // Ajoute de l'espace si il y a des actions
            }}
          >
            {item.icon && (
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
            )}
            <ListItemText
              primary={
                <Typography variant="subtitle1" fontWeight={500}>
                  {item.primary}
                </Typography>
              }
              secondary={
                <>
                  {Array.isArray(item.secondaryContent) 
                    ? item.secondaryContent.map((content, idx) => (
                        <Typography 
                          key={idx} 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ display: 'block', mb: 0.5 }}
                        >
                          {content}
                        </Typography>
                      ))
                    : item.secondaryContent
                  }
                  {item.status && (
                    <Box 
                      sx={{ 
                        display: 'inline-block',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        bgcolor: `${item.status.color}15`,
                        color: item.status.color,
                        mt: 1
                      }}
                    >
                      <Typography variant="caption">
                        {item.status.label}
                      </Typography>
                    </Box>
                  )}
                </>
              }
            />
            {item.actions && (
              <ListItemSecondaryAction>
                {item.actions}
              </ListItemSecondaryAction>
            )}
          </ListItem>
          {index < items.length - 1 && <Divider />}
        </Box>
      ))}
    </List>
  );
};

export default MobileList;