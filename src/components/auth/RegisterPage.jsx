import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import api from '../../services/axiosConfig';
import {
 Box,
 Paper,
 Typography,
 TextField,
 Button,
 Link,
 InputAdornment,
 IconButton,
 Alert,
 Stepper,
 Step,
 StepLabel
} from '@mui/material';
import { 
 Visibility, 
 VisibilityOff, 
 Email, 
 Lock,
 Person,
 Phone 
} from '@mui/icons-material';
import { setCredentials } from '../../store/slices/authSlice';

const steps = ['Informations personnelles', 'Authentification'];

const RegisterPage = () => {
 const dispatch = useDispatch();
 const navigate = useNavigate();
 const [activeStep, setActiveStep] = useState(0);

 const [formData, setFormData] = useState({
   firstName: '',
   lastName: '',
   phoneNumber: '',
   email: '',
   password: '',
   confirmPassword: ''
 });

 const [showPassword, setShowPassword] = useState(false);
 const [error, setError] = useState('');
 const [isLoading, setIsLoading] = useState(false);

 const handleChange = (e) => {
   setFormData({
     ...formData,
     [e.target.name]: e.target.value
   });
   setError('');
 };

 const validateStep = () => {
   if (activeStep === 0) {
     if (!formData.firstName || !formData.lastName || !formData.phoneNumber) {
       setError('Veuillez remplir tous les champs obligatoires');
       return false;
     }
     if (!formData.phoneNumber.match(/^(\+33|0)[1-9](\d{8})$/)) {
       setError('Numéro de téléphone invalide');
       return false;
     }
   } else {
     if (!formData.email || !formData.password || !formData.confirmPassword) {
       setError('Veuillez remplir tous les champs obligatoires');
       return false;
     }
     if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
       setError('Adresse email invalide');
       return false;
     }
     if (formData.password.length < 8) {
       setError('Le mot de passe doit contenir au moins 8 caractères');
       return false;
     }
     if (formData.password !== formData.confirmPassword) {
       setError('Les mots de passe ne correspondent pas');
       return false;
     }
   }
   return true;
 };

 const handleNext = () => {
   if (validateStep()) {
     setActiveStep((prev) => prev + 1);
     setError('');
   }
 };

 const handleBack = () => {
   setActiveStep((prev) => prev - 1);
   setError('');
 };

 const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateStep()) return;

  setIsLoading(true);
  try {
    const userData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      phoneNumber: formData.phoneNumber
    };

    console.log('Données envoyées:', userData); // Pour le débogage

    const response = await api.post('/auth/register', userData);

    console.log('Réponse serveur:', response.data); // Pour le débogage

    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      
      dispatch(setCredentials({
        user: response.data.data.user,
        token: response.data.token
      }));

      navigate('/');
    }
  } catch (err) {
    console.error('Erreur d\'inscription:', err.response?.data);
    setError(err.response?.data?.message || 'Une erreur est survenue lors de l\'inscription');
  } finally {
    setIsLoading(false);
  }
};

 return (
   <Box sx={{ 
     minHeight: '100vh', 
     display: 'flex', 
     flexDirection: 'column', 
     justifyContent: 'center',
     p: 2,
     bgcolor: 'background.default'
   }}>
     <Box sx={{ mb: 4, textAlign: 'center' }}>
       <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
         Créer un compte
       </Typography>
     </Box>

     <Paper elevation={2} sx={{ p: 3, maxWidth: 400, mx: 'auto', width: '100%' }}>
       <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
         {steps.map((label) => (
           <Step key={label}>
             <StepLabel>{label}</StepLabel>
           </Step>
         ))}
       </Stepper>

       <form onSubmit={handleSubmit}>
         {error && (
           <Alert severity="error" sx={{ mb: 2 }}>
             {error}
           </Alert>
         )}

         {activeStep === 0 ? (
           <>
             <TextField
               fullWidth
               label="Prénom"
               name="firstName"
               value={formData.firstName}
               onChange={handleChange}
               margin="normal"
               required
               InputProps={{
                 startAdornment: (
                   <InputAdornment position="start">
                     <Person color="action" />
                   </InputAdornment>
                 ),
               }}
             />

             <TextField
               fullWidth
               label="Nom"
               name="lastName"
               value={formData.lastName}
               onChange={handleChange}
               margin="normal"
               required
               InputProps={{
                 startAdornment: (
                   <InputAdornment position="start">
                     <Person color="action" />
                   </InputAdornment>
                 ),
               }}
             />

             <TextField
               fullWidth
               label="Téléphone"
               name="phoneNumber"
               value={formData.phoneNumber}
               onChange={handleChange}
               margin="normal"
               required
               InputProps={{
                 startAdornment: (
                   <InputAdornment position="start">
                     <Phone color="action" />
                   </InputAdornment>
                 ),
               }}
             />
           </>
         ) : (
           <>
             <TextField
               fullWidth
               label="Email"
               name="email"
               type="email"
               value={formData.email}
               onChange={handleChange}
               margin="normal"
               required
               InputProps={{
                 startAdornment: (
                   <InputAdornment position="start">
                     <Email color="action" />
                   </InputAdornment>
                 ),
               }}
             />

             <TextField
               fullWidth
               label="Mot de passe"
               name="password"
               type={showPassword ? 'text' : 'password'}
               value={formData.password}
               onChange={handleChange}
               margin="normal"
               required
               InputProps={{
                 startAdornment: (
                   <InputAdornment position="start">
                     <Lock color="action" />
                   </InputAdornment>
                 ),
                 endAdornment: (
                   <InputAdornment position="end">
                     <IconButton
                       edge="end"
                       onClick={() => setShowPassword(!showPassword)}
                     >
                       {showPassword ? <VisibilityOff /> : <Visibility />}
                     </IconButton>
                   </InputAdornment>
                 ),
               }}
             />

             <TextField
               fullWidth
               label="Confirmer le mot de passe"
               name="confirmPassword"
               type={showPassword ? 'text' : 'password'}
               value={formData.confirmPassword}
               onChange={handleChange}
               margin="normal"
               required
               InputProps={{
                 startAdornment: (
                   <InputAdornment position="start">
                     <Lock color="action" />
                   </InputAdornment>
                 ),
               }}
             />
           </>
         )}

         <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
           {activeStep > 0 && (
             <Button onClick={handleBack}>
               Retour
             </Button>
           )}
           <Button
             variant="contained"
             onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
             sx={{ ml: 'auto' }}
             disabled={isLoading}
           >
             {activeStep === steps.length - 1 ? 
               (isLoading ? 'Inscription...' : 'S\'inscrire') : 
               'Suivant'}
           </Button>
         </Box>

         <Box sx={{ mt: 3, textAlign: 'center' }}>
           <Typography variant="body2" color="text.secondary">
             Déjà inscrit ?{' '}
             <Link component={RouterLink} to="/login" variant="body2">
               Se connecter
             </Link>
           </Typography>
         </Box>
       </form>
     </Paper>
   </Box>
 );
};

export default RegisterPage;