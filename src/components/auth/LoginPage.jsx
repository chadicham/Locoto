import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
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
  CircularProgress
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import { setCredentials } from '../../store/slices/authSlice';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [formData, setFormData] = useState({
    email: '',
    password: ''
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

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email) {
      errors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Format d\'email invalide';
    }
    
    if (!formData.password) {
      errors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
  
    if (Object.keys(formErrors).length > 0) {
      setError('Veuillez corriger les erreurs dans le formulaire');
      return;
    }
  
    setIsLoading(true);
    setError('');
    
    // Retry logic
    const maxRetries = 2;
    let lastError = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔐 Tentative ${attempt}/${maxRetries} de connexion avec:`, { email: formData.email });
        
        const response = await api.post('/auth/login', formData, {
          timeout: 10000, // 10 secondes de timeout
          skipCache: true // Forcer pas de cache pour le login
        });
        
        console.log('✅ Réponse du serveur:', response.data);
        
        if (response.data.token && response.data.data?.user) {
          localStorage.setItem('token', response.data.token);
          
          dispatch(setCredentials({
            user: response.data.data.user,
            token: response.data.token
          }));
          
          console.log('✅ Credentials stockées, navigation vers:', from);
          
          // Petite pause pour s'assurer que le state est mis à jour
          await new Promise(resolve => setTimeout(resolve, 100));
          
          navigate(from, { replace: true });
          return; // Succès, on sort de la fonction
        } else {
          console.error('❌ Réponse invalide:', response.data);
          lastError = new Error('Réponse du serveur invalide');
        }
      } catch (err) {
        console.error(`❌ Erreur tentative ${attempt}:`, err);
        lastError = err;
        
        // Si ce n'est pas la dernière tentative et que c'est une erreur réseau, on retry
        if (attempt < maxRetries && (err.code === 'ECONNABORTED' || err.code === 'ERR_NETWORK')) {
          console.log(`⏳ Nouvelle tentative dans 500ms...`);
          await new Promise(resolve => setTimeout(resolve, 500));
          continue;
        }
        
        // Si c'est une erreur d'authentification (401), on ne retry pas
        if (err.response?.status === 401) {
          break;
        }
      }
    }
    
    // Si on arrive ici, toutes les tentatives ont échoué
    console.error('❌ Échec après', maxRetries, 'tentatives');
    const errorMessage = lastError?.response?.data?.message || 
                        lastError?.message || 
                        'Erreur de connexion. Veuillez réessayer.';
    
    setError(errorMessage);
    setIsLoading(false);
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
          Locoto
        </Typography>
        <Typography color="text.secondary">
          Connectez-vous à votre compte
        </Typography>
      </Box>

      <Paper elevation={2} sx={{ p: 3, maxWidth: 400, mx: 'auto', width: '100%' }}>
        <form onSubmit={handleSubmit}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

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

          <Box sx={{ mt: 1, mb: 2, textAlign: 'right' }}>
            <Link href="/forgot-password" variant="body2">
              Mot de passe oublié ?
            </Link>
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={isLoading}
            sx={{ mb: 2 }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Se connecter'
            )}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Pas encore de compte ?{' '}
              <Link href="/register" variant="body2">
                S'inscrire
              </Link>
            </Typography>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default LoginPage;