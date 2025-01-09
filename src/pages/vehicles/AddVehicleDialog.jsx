import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  Box,
  Typography,
  IconButton,
  ImageList,
  ImageListItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  OutlinedInput
} from '@mui/material';
import {
  AddPhotoAlternate,
  Delete
} from '@mui/icons-material';

const FUEL_TYPES = ['Essence', 'Diesel', 'Hybride', 'Électrique'];
const VEHICLE_TYPES = ['Citadine', 'Berline', 'SUV', 'Break', 'Monospace', 'Utilitaire'];
const FEATURES = [
  'Climatisation',
  'GPS',
  'Bluetooth',
  'Régulateur de vitesse',
  'Caméra de recul',
  'Audio premium'
];

const AddVehicleDialog = ({ open, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: '',
    licensePlate: '',
    fuel: '',
    mileage: '',
    dailyRate: '',
    type: '',
    transmission: 'Manuelle',
    features: [],
    description: '',
    images: []
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    return () => {
      formData.images.forEach(imageUrl => {
        if (imageUrl.startsWith('blob:')) {
          URL.revokeObjectURL(imageUrl);
        }
      });
    };
  }, [formData.images]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFeaturesChange = (event) => {
    const { value } = event.target;
    setFormData(prev => ({
      ...prev,
      features: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;

    input.onchange = (event) => {
      const files = Array.from(event.target.files);
      
      const validFiles = files.filter(file => {
        const isValidSize = file.size <= 5 * 1024 * 1024;
        if (!isValidSize) {
          alert(`L'image ${file.name} est trop volumineuse. Taille maximum: 5MB`);
        }
        return isValidSize;
      });

      const totalImages = formData.images.length + validFiles.length;
      if (totalImages > 5) {
        alert('Vous pouvez ajouter jusqu'à 5 images maximum');
        return;
      }

      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, e.target.result]
          }));
        };
        reader.readAsDataURL(file);
      });
    };

    input.click();
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.brand.trim()) newErrors.brand = 'La marque est requise';
    if (!formData.model.trim()) newErrors.model = 'Le modèle est requis';
    if (!formData.licensePlate.trim()) newErrors.licensePlate = "La plaque d'immatriculation est requise";
    if (!formData.fuel) newErrors.fuel = 'Le type de carburant est requis';
    if (!formData.type) newErrors.type = 'Le type de véhicule est requis';
    if (!formData.year) {
      newErrors.year = "L'année est requise";
    } else if (formData.year < 1900 || formData.year > new Date().getFullYear()) {
      newErrors.year = 'Année invalide';
    }
    if (!formData.dailyRate) {
      newErrors.dailyRate = 'Le tarif journalier est requis';
    } else if (isNaN(formData.dailyRate) || formData.dailyRate <= 0) {
      newErrors.dailyRate = 'Le tarif doit être supérieur à 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      setFormData({
        brand: '',
        model: '',
        year: '',
        licensePlate: '',
        fuel: '',
        mileage: '',
        dailyRate: '',
        type: '',
        features: [],
        description: '',
        images: []
      });
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Ajouter un véhicule</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            {/* Section Images */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Photos du véhicule (maximum 5 photos)
              </Typography>
              <Box sx={{ mb: 2 }}>
                <ImageList 
                  sx={{ 
                    maxHeight: 200,
                    border: formData.images.length === 0 ? '2px dashed #ccc' : 'none',
                    borderRadius: 1,
                    p: 1
                  }} 
                  cols={3} 
                  rowHeight={164}
                >
                  {formData.images.map((image, index) => (
                    <ImageListItem key={index}>
                      <img
                        src={image}
                        alt={`Véhicule ${index + 1}`}
                        loading="lazy"
                        style={{ 
                          height: '100%',
                          width: '100%',
                          objectFit: 'cover',
                          borderRadius: '4px'
                        }}
                      />
                      <IconButton
                        onClick={() => handleRemoveImage(index)}
                        sx={{
                          position: 'absolute',
                          top: 5,
                          right: 5,
                          backgroundColor: 'rgba(0, 0, 0, 0.5)',
                          '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.7)' }
                        }}
                      >
                        <Delete sx={{ color: 'white' }} />
                      </IconButton>
                    </ImageListItem>
                  ))}
                </ImageList>
                <Button
                  variant="outlined"
                  startIcon={<AddPhotoAlternate />}
                  onClick={handleImageUpload}
                  disabled={formData.images.length >= 5}
                  sx={{ mt: 1 }}
                >
                  {formData.images.length === 0 ? 'Ajouter des photos' : 'Ajouter plus de photos'}
                </Button>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Format accepté: JPG, PNG • Taille maximum: 5MB par image
                </Typography>
              </Box>
            </Grid>

            {/* Informations de base */}
            <Grid item xs={12} sm={6}>
              <TextField
                name="brand"
                label="Marque"
                value={formData.brand}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.brand}
                helperText={errors.brand}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="model"
                label="Modèle"
                value={formData.model}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.model}
                helperText={errors.model}
              />
            </Grid>

            {/* Type et année */}
            <Grid item xs={12} sm={6}>
              <TextField
                name="type"
                label="Type de véhicule"
                select
                value={formData.type}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.type}
                helperText={errors.type}
              >
                {VEHICLE_TYPES.map(option => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="year"
                label="Année"
                type="number"
                value={formData.year}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.year}
                helperText={errors.year}
              />
            </Grid>

            {/* Caractéristiques techniques */}
            <Grid item xs={12} sm={6}>
              <TextField
                name="licensePlate"
                label="Immatriculation"
                value={formData.licensePlate}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.licensePlate}
                helperText={errors.licensePlate}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="fuel"
                label="Carburant"
                select
                value={formData.fuel}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.fuel}
                helperText={errors.fuel}
              >
                {FUEL_TYPES.map(option => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Kilométrage et tarif */}
            <Grid item xs={12} sm={6}>
              <TextField
                name="mileage"
                label="Kilométrage"
                type="number"
                value={formData.mileage}
                onChange={handleChange}
                fullWidth
                InputProps={{
                  endAdornment: <Box component="span" sx={{ color: 'text.secondary' }}>km</Box>
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="dailyRate"
                label="Tarif journalier"
                type="number"
                value={formData.dailyRate}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.dailyRate}
                helperText={errors.dailyRate}
                InputProps={{
                  startAdornment: <Box component="span" sx={{ color: 'text.secondary' }}>€</Box>
                }}
              />
            </Grid>

            {/* Équipements */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Équipements</InputLabel>
                <Select
                  multiple
                  name="features"
                  value={formData.features}
                  onChange={handleFeaturesChange}
                  input={<OutlinedInput label="Équipements" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  {FEATURES.map((feature) => (
                    <MenuItem key={feature} value={feature}>
                      {feature}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                multiline
                rows={4}
                value={formData.description}
                onChange={handleChange}
                fullWidth
                placeholder="Décrivez votre véhicule en quelques mots..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Annuler</Button>
          <Button type="submit" variant="contained">Ajouter</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddVehicleDialog;