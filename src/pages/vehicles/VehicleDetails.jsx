import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  IconButton,
  Button,
  Dialog,
  ImageList,
  ImageListItem,
} from '@mui/material';
import {
  Edit,
  Delete,
  NavigateBefore,
  NavigateNext,
  LocalGasStation,
  Speed,
  Euro,
  Category
} from '@mui/icons-material';

const VehicleDetails = ({ vehicle, onEdit, onDelete }) => {
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleImageClick = (index) => {
    setSelectedImageIndex(index);
    setOpenImageDialog(true);
  };

  const handleNavigateImage = (direction) => {
    const newIndex = direction === 'next'
      ? (selectedImageIndex + 1) % vehicle.images.length
      : selectedImageIndex === 0
        ? vehicle.images.length - 1
        : selectedImageIndex - 1;
    setSelectedImageIndex(newIndex);
  };

  return (
    <Box sx={{ p: 2, pb: 8 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5" component="h1" fontWeight="600">
            {vehicle.brand} {vehicle.model}
          </Typography>
          <Box>
            <IconButton onClick={onEdit} color="primary">
              <Edit />
            </IconButton>
            <IconButton onClick={onDelete} color="error">
              <Delete />
            </IconButton>
          </Box>
        </Box>

        {/* Images du véhicule */}
        <Box sx={{ mb: 4 }}>
          <ImageList sx={{ maxHeight: 300 }} cols={vehicle.images.length > 1 ? 2 : 1} gap={8}>
            {vehicle.images.map((image, index) => (
              <ImageListItem 
                key={index}
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { opacity: 0.9 }
                }}
                onClick={() => handleImageClick(index)}
              >
                <img
                  src={image}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  loading="lazy"
                  style={{ 
                    borderRadius: '8px',
                    height: '100%',
                    width: '100%',
                    objectFit: 'cover'
                  }}
                />
              </ImageListItem>
            ))}
          </ImageList>
        </Box>

        {/* Caractéristiques principales */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Category sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">Type</Typography>
              <Typography variant="subtitle1" fontWeight="500">{vehicle.type}</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <LocalGasStation sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">Carburant</Typography>
              <Typography variant="subtitle1" fontWeight="500">{vehicle.fuel}</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Speed sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">Kilométrage</Typography>
              <Typography variant="subtitle1" fontWeight="500">{vehicle.mileage} km</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Euro sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">Tarif journalier</Typography>
              <Typography variant="subtitle1" fontWeight="500">{vehicle.dailyRate}CHF</Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Informations détaillées */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Immatriculation
            </Typography>
            <Typography variant="body1" gutterBottom>
              {vehicle.licensePlate}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Année
            </Typography>
            <Typography variant="body1" gutterBottom>
              {vehicle.year}
            </Typography>
          </Grid>
        </Grid>

        {/* Équipements */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Équipements
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {vehicle.features.map((feature, index) => (
              <Chip key={index} label={feature} />
            ))}
          </Box>
        </Box>

        {/* Description */}
        {vehicle.description && (
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1">
              {vehicle.description}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Dialog pour l'affichage des images en plein écran */}
      <Dialog
        open={openImageDialog}
        onClose={() => setOpenImageDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <Box sx={{ position: 'relative', bgcolor: 'black', p: 2 }}>
          <img
            src={vehicle.images[selectedImageIndex]}
            alt={`${vehicle.brand} ${vehicle.model}`}
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '80vh',
              objectFit: 'contain'
            }}
          />
          {vehicle.images.length > 1 && (
            <>
              <IconButton
                onClick={() => handleNavigateImage('prev')}
                sx={{
                  position: 'absolute',
                  left: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'rgba(255,255,255,0.3)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.5)' }
                }}
              >
                <NavigateBefore />
              </IconButton>
              <IconButton
                onClick={() => handleNavigateImage('next')}
                sx={{
                  position: 'absolute',
                  right: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'rgba(255,255,255,0.3)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.5)' }
                }}
              >
                <NavigateNext />
              </IconButton>
            </>
          )}
        </Box>
      </Dialog>
    </Box>
  );
};

export default VehicleDetails;