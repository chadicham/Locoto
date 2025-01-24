import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  Box,
  Typography,
  CircularProgress,
  Alert,
  ImageList,
  ImageListItem,
  IconButton,
  FormControlLabel,
  Checkbox,
  Divider
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  ChevronRight
} from '@mui/icons-material';
import vehicleService from '../../services/vehicleService';

const VEHICLE_TYPES = [
  'Citadine',
  'Berline',
  'SUV',
  'Break',
  'Monospace',
  'Utilitaire'
];

const FUEL_TYPES = [
  'Essence',
  'Diesel',
  'Hybride',
  'Électrique'
];

const FEATURES = [
  'Climatisation',
  'GPS',
  'Bluetooth',
  'Siège bébé',
  'Régulateur de vitesse',
  'Caméra de recul',
  'Toit ouvrant',
  'Audio premium'
];

const AddVehicleDialog = ({ open, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    type: '',
    licensePlate: '',
    fuel: '',
    year: new Date().getFullYear(),
    mileage: '',
    dailyRate: '',
    description: '',
    features: [],
    images: [],
    documents: {
      insurance: null,
      registration: null
    }
  });

  const [previewImages, setPreviewImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeStep, setActiveStep] = useState(0);

  const validateStep = () => {
    const errors = {};

    switch (activeStep) {
      case 0: // Informations principales
        if (!formData.brand) errors.brand = 'La marque est requise';
        if (!formData.model) errors.model = 'Le modèle est requis';
        if (!formData.type) errors.type = 'Le type de véhicule est requis';
        if (!formData.licensePlate) errors.licensePlate = "L'immatriculation est requise";
        break;

      case 1: // Caractéristiques techniques
        if (!formData.fuel) errors.fuel = 'Le type de carburant est requis';
        if (!formData.mileage) errors.mileage = 'Le kilométrage est requis';
        if (formData.mileage < 0) errors.mileage = 'Le kilométrage doit être positif';
        if (!formData.dailyRate) errors.dailyRate = 'Le tarif journalier est requis';
        if (formData.dailyRate <= 0) errors.dailyRate = 'Le tarif doit être supérieur à 0';
        break;

      case 2: // Photos et documents
        if (previewImages.length === 0) {
          errors.images = 'Au moins une photo est requise';
        }
        break;
    }

    setError(Object.keys(errors).length > 0 ? errors : null);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (error?.[name]) {
      setError(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleFeaturesChange = (feature) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + previewImages.length > 5) {
      setError(prev => ({
        ...prev,
        images: 'Maximum 5 images autorisées'
      }));
      return;
    }

    const validFiles = files.filter(file => {
      const isValid = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB max
      return isValid && isValidSize;
    });

    if (validFiles.length !== files.length) {
      setError(prev => ({
        ...prev,
        images: 'Certains fichiers ont été ignorés (format invalide ou taille > 5MB)'
      }));
    }

    const newPreviewImages = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setPreviewImages(prev => [...prev, ...newPreviewImages]);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...validFiles]
    }));
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(previewImages[index].preview);
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    try {
      setLoading(true);
      setError(null);
      await vehicleService.createVehicle(formData);
      onSuccess();
    } catch (err) {
      setError({
        submit: err.message || 'Une erreur est survenue lors de la création du véhicule'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="brand"
                label="Marque"
                value={formData.brand}
                onChange={handleChange}
                error={!!error?.brand}
                helperText={error?.brand}
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="model"
                label="Modèle"
                value={formData.model}
                onChange={handleChange}
                error={!!error?.model}
                helperText={error?.model}
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                name="type"
                label="Type de véhicule"
                value={formData.type}
                onChange={handleChange}
                error={!!error?.type}
                helperText={error?.type}
                required
                fullWidth
              >
                {VEHICLE_TYPES.map(type => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="licensePlate"
                label="Immatriculation"
                value={formData.licensePlate}
                onChange={handleChange}
                error={!!error?.licensePlate}
                helperText={error?.licensePlate}
                required
                fullWidth
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  name="fuel"
                  label="Carburant"
                  value={formData.fuel}
                  onChange={handleChange}
                  error={!!error?.fuel}
                  helperText={error?.fuel}
                  required
                  fullWidth
                >
                  {FUEL_TYPES.map(fuel => (
                    <MenuItem key={fuel} value={fuel}>{fuel}</MenuItem>
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
                  required
                  fullWidth
                  InputProps={{
                    inputProps: { 
                      min: 1900,
                      max: new Date().getFullYear() 
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="mileage"
                  label="Kilométrage"
                  type="number"
                  value={formData.mileage}
                  onChange={handleChange}
                  error={!!error?.mileage}
                  helperText={error?.mileage}
                  required
                  fullWidth
                  InputProps={{
                    endAdornment: <Typography variant="body2">km</Typography>
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
                  error={!!error?.dailyRate}
                  helperText={error?.dailyRate}
                  required
                  fullWidth
                  InputProps={{
                    startAdornment: <Typography variant="body2">€</Typography>
                  }}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle1" gutterBottom>
              Équipements
            </Typography>
            <Grid container spacing={1}>
              {FEATURES.map(feature => (
                <Grid item xs={12} sm={6} key={feature}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.features.includes(feature)}
                        onChange={() => handleFeaturesChange(feature)}
                      />
                    }
                    label={feature}
                  />
                </Grid>
              ))}
            </Grid>
          </>
        );

      case 2:
        return (
          <>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Photos du véhicule
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Ajoutez jusqu'à 5 photos de votre véhicule. Première photo = photo principale
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUpload />}
                disabled={previewImages.length >= 5}
                sx={{ mt: 1 }}
              >
                Ajouter des photos
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                />
              </Button>

              {error?.images && (
                <Typography color="error" variant="caption" sx={{ display: 'block', mt: 1 }}>
                  {error.images}
                </Typography>
              )}
            </Box>

            {previewImages.length > 0 && (
              <ImageList cols={3} rowHeight={160} gap={8}>
                {previewImages.map((image, index) => (
                  <ImageListItem key={index}>
                    <img
                      src={image.preview}
                      alt={`Véhicule ${index + 1}`}
                      loading="lazy"
                      style={{ height: '100%', objectFit: 'cover' }}
                    />
                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: 5,
                        right: 5,
                        bgcolor: 'rgba(0, 0, 0, 0.5)',
                        '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' }
                      }}
                      onClick={() => removeImage(index)}
                    >
                      <Delete sx={{ color: 'white' }} />
                    </IconButton>
                  </ImageListItem>
                ))}
              </ImageList>
            )}

            <TextField
              name="description"
              label="Description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={4}
              fullWidth
              sx={{ mt: 3 }}
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '50vh'
        }
      }}
    >
      <DialogTitle>
        Ajouter un véhicule
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error?.submit && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error.submit}
            </Alert>
          )}

          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Étape {activeStep + 1} sur 3
            </Typography>
          </Box>

          {renderStepContent()}
        </DialogContent>

        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          
          {activeStep > 0 && (
            <Button onClick={handleBack} disabled={loading}>
              Précédent
            </Button>
          )}

          {activeStep < 2 ? (
            <Button 
              onClick={handleNext}
              variant="contained"
              endIcon={<ChevronRight />}
            >
              Suivant
            </Button>
          ) : (
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} />}
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          )}
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddVehicleDialog;