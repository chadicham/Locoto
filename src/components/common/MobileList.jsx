import { List, ListItem, ListItemText, ListItemIcon, Box, Typography, Divider } from '@mui/material';

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
            }}
          >
            {item.icon && (
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
            )}
            <ListItemText
              primary={item.primary}
              secondary={item.secondary}
              primaryTypographyProps={{
                fontWeight: 500,
              }}
            />
          </ListItem>
          {index < items.length - 1 && <Divider />}
        </Box>
      ))}
    </List>
  );
};

export default MobileList;