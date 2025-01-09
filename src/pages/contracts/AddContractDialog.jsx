import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  Grid,
  TextField,
  Box,
  Typography,
  MenuItem,
  InputAdornment
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';
import DocumentUpload from '../../components/contracts/DocumentUpload';
import { generateContractPDF } from '../../services/pdfService';

const steps = [
  'Choix du véhicule',
  'Informations locataire',
  'Détails de la location',
  'Documents requis',
  'Signatures'
];

const AddContractDialog = ({ open, onClose, onSubmit, vehicles = [] }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    // Étape 1 : Véhicule
    vehicleId: '',
    
    // Étape 2 : Locataire
    renterName: '',
    renterEmail: '',
    renterPhone: '',
    renterAddress: '',
    renterCity: '',
    renterPostalCode: '',

    // Étape 3 : Location
    startDate: null,
    endDate: null,
    initialMileage: '',
    allowedMileage: '',
    fuelLevel: 100,
    rentalAmount: '',
    deposit: '',
    paymentStatus: 'pending',

    // Étape 4 : Documents
    idCard: null,
    drivingLicense: null,
    proofOfAddress: null,
    vehiclePhotos: null,

    // Étape 5 : Signatures
    renterSignature: null,
    ownerSignature: null
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleDocumentChange = (documentType, documentData) => {
    setFormData(prev => ({
      ...prev,
      [documentType]: documentData
    }));
    if (errors[documentType]) {
      setErrors(prev => ({ ...prev, [documentType]: '' }));
    }
  };

  const validateStep = () => {
    const newErrors = {};

    switch (activeStep) {
      case 0:
        if (!formData.vehicleId) {
          newErrors.vehicleId = 'Veuillez sélectionner un véhicule';
        }
        break;

      case 1:
        if (!formData.renterName) newErrors.renterName = 'Le nom est requis';
        if (!formData.renterEmail) {
          newErrors.renterEmail = "L'email est requis";
        } else if (!/\S+@\S+\.\S+/.test(formData.renterEmail)) {
          newErrors.renterEmail = "Format d'email invalide";
        }
        if (!formData.renterPhone) {
          newErrors.renterPhone = 'Le téléphone est requis';
        }
        if (!formData.renterAddress) newErrors.renterAddress = "L'adresse est requise";
        if (!formData.renterCity) newErrors.renterCity = 'La ville est requise';
        if (!formData.renterPostalCode) {
          newErrors.renterPostalCode = 'Le code postal est requis';
        } else if (!/^\d{5}$/.test(formData.renterPostalCode)) {
          newErrors.renterPostalCode = 'Code postal invalide';
        }
        break;

      case 2:
        if (!formData.startDate) newErrors.startDate = 'La date de début est requise';
        if (!formData.endDate) newErrors.endDate = 'La date de fin est requise';
        if (!formData.initialMileage) newErrors.initialMileage = 'Le kilométrage initial est requis';
        if (!formData.rentalAmount) {
          newErrors.rentalAmount = 'Le montant de la location est requis';
        } else if (formData.rentalAmount <= 0) {
          newErrors.rentalAmount = 'Le montant doit être supérieur à 0';
        }
        break;

      case 3:
        if (!formData.idCard) newErrors.idCard = "La pièce d'identité est requise";
        if (!formData.drivingLicense) newErrors.drivingLicense = 'Le permis de conduire est requis';
        if (!formData.proofOfAddress) newErrors.proofOfAddress = 'Le justificatif de domicile est requis';
        if (!formData.vehiclePhotos) newErrors.vehiclePhotos = "Les photos du véhicule sont requises";
        break;

      case 4:
        if (!formData.renterSignature) newErrors.renterSignature = 'La signature du locataire est requise';
        if (!formData.ownerSignature) newErrors.ownerSignature = 'La signature du propriétaire est requise';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (validateStep()) {
      if (activeStep === steps.length - 1) {
        try {
          // Générer le PDF
          const pdfDoc = await generateContractPDF(formData);
          
          // Télécharger le PDF
          pdfDoc.download(`contrat_${formData.renterName.replace(/\s+/g, '_')}.pdf`);
          
          // Soumettre le contrat
          onSubmit(formData);
          
          // Fermer le dialogue
          onClose();
        } catch (error) {
          console.error('Erreur lors de la génération du PDF:', error);
          setErrors(prev => ({
            ...prev,
            general: 'Erreur lors de la génération du contrat'
          }));
        }
      } else {
        setActiveStep((prev) => prev + 1);
      }
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Sélectionner un véhicule"
                value={formData.vehicleId}
                onChange={(e) => handleChange('vehicleId', e.target.value)}
                error={!!errors.vehicleId}
                helperText={errors.vehicleId}
              >
                {vehicles.map((vehicle) => (
                  <MenuItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.brand} {vehicle.model} - {vehicle.licensePlate}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nom complet"
                value={formData.renterName}
                onChange={(e) => handleChange('renterName', e.target.value)}
                error={!!errors.renterName}
                helperText={errors.renterName}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.renterEmail}
                onChange={(e) => handleChange('renterEmail', e.target.value)}
                error={!!errors.renterEmail}
                helperText={errors.renterEmail}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Téléphone"
                value={formData.renterPhone}
                onChange={(e) => handleChange('renterPhone', e.target.value)}
                error={!!errors.renterPhone}
                helperText={errors.renterPhone}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Adresse"
                value={formData.renterAddress}
                onChange={(e) => handleChange('renterAddress', e.target.value)}
                error={!!errors.renterAddress}
                helperText={errors.renterAddress}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Ville"
                value={formData.renterCity}
                onChange={(e) => handleChange('renterCity', e.target.value)}
                error={!!errors.renterCity}
                helperText={errors.renterCity}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Code postal"
                value={formData.renterPostalCode}
                onChange={(e) => handleChange('renterPostalCode', e.target.value)}
                error={!!errors.renterPostalCode}
                helperText={errors.renterPostalCode}
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Date de début"
                  value={formData.startDate}
                  onChange={(date) => handleChange('startDate', date)}
                  format="dd/MM/yyyy"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.startDate,
                      helperText: errors.startDate
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Date de fin"
                  value={formData.endDate}
                  onChange={(date) => handleChange('endDate', date)}
                  format="dd/MM/yyyy"
                  minDate={formData.startDate}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.endDate,
                      helperText: errors.endDate
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Kilométrage initial"
                  type="number"
                  value={formData.initialMileage}
                  onChange={(e) => handleChange('initialMileage', e.target.value)}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">km</InputAdornment>,
                  }}
                  error={!!errors.initialMileage}
                  helperText={errors.initialMileage}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Kilométrage autorisé"
                  type="number"
                  value={formData.allowedMileage}
                  onChange={(e) => handleChange('allowedMileage', e.target.value)}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">km</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Montant de la location"
                  type="number"
                  value={formData.rentalAmount}
                  onChange={(e) => handleChange('rentalAmount', e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">€</InputAdornment>,
                  }}
                  error={!!errors.rentalAmount}
                  helperText={errors.rentalAmount}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Caution"
                  type="number"
                  value={formData.deposit}
                  onChange={(e) => handleChange('deposit', e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">€</InputAdornment>,
                  }}
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
        );

      case 3:
        return (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Documents requis pour le contrat
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Veuillez fournir les documents suivants. Tous les documents doivent être lisibles et en cours de validité.
            </Typography>
            
            <DocumentUpload
              documents={formData}
              onDocumentChange={handleDocumentChange}
              errors={errors}
            />
          </Box>
        );

        case 4:
            return (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Signatures du contrat
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Veuillez signer dans les zones prévues à cet effet. Les signatures seront incluses dans le contrat final.
                </Typography>
          
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <SignatureCanvas
                      label="Signature du locataire"
                      onSignatureCapture={(signature) => handleChange('renterSignature', signature)}
                      error={errors.renterSignature}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <SignatureCanvas
                      label="Signature du propriétaire"
                      onSignatureCapture={(signature) => handleChange('ownerSignature', signature)}
                      error={errors.ownerSignature}
                    />
                  </Grid>
                </Grid>
          
                {/* Résumé des informations importantes */}
                <Box sx={{ mt: 4, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    Résumé du contrat
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    En signant ce contrat, les deux parties s'engagent à respecter les conditions suivantes :
                  </Typography>
                  <ul>
                    <li>Location du {format(formData.startDate, 'dd/MM/yyyy')} au {format(formData.endDate, 'dd/MM/yyyy')}</li>
                    <li>Montant total de la location : {formData.rentalAmount}€</li>
                    <li>Caution : {formData.deposit}€</li>
                    <li>Kilométrage autorisé : {formData.allowedMileage} km</li>
                  </ul>
                </Box>
              </Box>
            );

      default:
        return null;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle>Nouveau contrat de location</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, mb: 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
        {renderStepContent(activeStep)}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        {activeStep > 0 && (
          <Button onClick={handleBack}>
            Précédent
          </Button>
        )}
        <Button 
          variant="contained" 
          onClick={handleNext}
        >
          {activeStep === steps.length - 1 ? 'Terminer' : 'Suivant'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddContractDialog;