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
    
    try {
      console.log('🔐 Tentative de connexion avec:', { email: formData.email });
      
      const response = await api.post('/auth/login', formData);
      
      console.log('✅ Réponse du serveur:', response.data);
      
      if (response.data.token && response.data.data?.user) {
        // Sauvegarder le token en premier
        localStorage.setItem('token', response.data.token);
        
        // Puis mettre à jour Redux
        dispatch(setCredentials({
          user: response.data.data.user,
          token: response.data.token
        }));
        
        console.log('✅ Connexion réussie, navigation vers:', from);
        
        // Navigation immédiate
        navigate(from, { replace: true });
      } else {
        console.error('❌ Réponse invalide du serveur');
        setError('Réponse du serveur invalide');
      }
    } catch (err) {
      console.error('❌ Erreur de connexion:', err);
      console.error('❌ Status:', err.response?.status);
      console.error('❌ Data:', err.response?.data);
      
      // Message d'erreur spécifique selon le type d'erreur
      let errorMessage = 'Erreur de connexion. Veuillez réessayer.';
      
      if (err.response?.status === 401) {
        errorMessage = err.response?.data?.message || 'Email ou mot de passe incorrect';
      } else if (err.code === 'ECONNABORTED' || err.code === 'ERR_NETWORK') {
        errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError(errorMessage);
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